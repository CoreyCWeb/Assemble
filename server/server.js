// Set up
var express = require('express');
var app = express();
var mongoose = require('mongoose'), Schema = mongoose.Schema;
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');
var async = require("async");
var jwt    = require('jsonwebtoken');
var config = require('./config'); // get our config file
var shortid = require('shortid');

// Twilio
var client = require('twilio')(
  "AC45c1e479c5119fa24418a83f372c989a",
  "0eaec58380df8ad2020969b838def32f"
);

/*Sockets*/
var http = require('http').Server(app);
let io = require('socket.io')(http);

//SOCKETS
io.sockets.on('connection', (socket) => {
  console.log('user connected');
  
  socket.on('disconnect', function(){
    console.log('user disconnected', socket.client.sockets);
    socket.disconnect();
  });
  
  socket.on('create', function(groupCodeP){
      socket.join(groupCodeP);
      //Send this event to everyone in the group.
      io.sockets.in(groupCodeP).emit('connectTogroup', "You created and joined group: "+ groupCodeP);
  });

  socket.on('join', function(groupCodeP){
      console.log("server - client connect to group" +groupCodeP);
      socket.join(groupCodeP);
      //Send this event to everyone in the group.
      io.sockets.in(groupCodeP).emit('connectTogroup', socket.id);
  });

  socket.on('sendInvite', function(data, groupCodeP){
    console.log("server - sending invite to group "+ groupCodeP);
    io.sockets.in(groupCodeP).emit('invite', data);    
  });

});

http.listen(5000, () => {
  console.log('socket on port 5000');
});

// Configuration
mongoose.connect(config.database);
app.set('superSecret', config.secret); // secret variable

app.use(bodyParser.urlencoded({extended: false})); // Parses urlencoded bodies
app.use(bodyParser.json()); // Send JSON responses
app.use(logger('dev')); // Log requests to API using morgan
app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Models

var userSchema = Schema( {
    username: String,
    password: String,
    color: String,
    phone: String,
    groups: [{ type: Schema.Types.ObjectId, ref: 'Group'}]
});

var groupSchema = Schema({
    name: String,
    code: String,
    admin: {type: Schema.Types.ObjectId, ref: 'User', default: null},
    invites: [{ type: Schema.Types.ObjectId, ref: 'Invite'}]
});

var inviteSchema = Schema({
    group: String,
    date: Date,
    user: {type: Schema.Types.ObjectId, ref: 'User', default: null},
    going:  [{ type: Schema.Types.ObjectId, ref: 'User'}]
});

var User = mongoose.model('User', userSchema);
var Group = mongoose.model('Group', groupSchema); 

groupSchema.pre('remove', function(next){
    console.log("deleting group");
    this.model('User').update(
        {_id: {$in: this.users}}, 
        {$pull: {groups: this._id}}, 
        {multi: true},
        next
    );
});

var Invite = mongoose.model('Invite', inviteSchema); 

//Helper Functions
function loadResource(model, name) {
  return function(req, res, next) {
    model.findById(req.params.id, function(err, resource) {
      if (err)
        return res.json({error: "Error fetching " + name});
      else if (!resource)
        return res.json({error: "Error finding the " + name});

      req.resource = resource;
      next();
    });
  }
}

function errorResponse(res, error) {
    res.status(400);
    res.json({ error: error});
}

function getObjectsFromIdArray(modal, array){
    return new Promise(function (resolve, reject){
        var itemsLeft = array.length;
        var result = [];

        if (itemsLeft === 0) {
            console.log("Empty");
            resolve(result);
        } else {
            array.forEach(function(id){
                modal.findById(id, function(err, obj){
                    result.push(obj);
                    if(--itemsLeft === 0)
                        resolve(result);
                });
            })
        }
    });
}

//Twilio
app.post('/api/text', function(req, res){
    console.log(req.body.phone);
    client.messages.create({
        from: "+1 844-846-3185" ,
        to: req.body.phone,
        body: "Assemble request from " + req.body.group
        }, function(err, message) {
        if(err) {
            errorResponse(res, "Text message failed.");
        }
    });
});


// Routes

/**
 * Auth API
 */
// route to authenticate a user (POST http://localhost:8080/api/authenticate)
app.post('/api/authenticate', function(req, res) {

    console.log(req.body.username, req.body.password);
  // find the user
  User.findOne({
    username: req.body.username
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      errorResponse(res, "User not found");
    } else if (user) {

      // check if password matches
      if (user.password != req.body.password) {
        console.log("passwords dont match");
        errorResponse(res, "Incorrect Password");
      } else {

        // if user is found and password is right
        // create a token
        var token = jwt.sign(user, app.get('superSecret'), {
    
        });

        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          user: user,
          token: token
        });
      }   

    }

  });
});

//Middleware
app.use(function(req, res, next) {

  if (req.originalUrl === '/api/user') {
    return next();
  }
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });

  }
});

/**
 * Users API
 */

// Get Users
app.get('/setup', function(req, res) {

  // create a sample user
  var nick = new User({ 
    username: 'Nick Cerminara',
    password: 'password'
  });

  // save the sample user
  nick.save(function(err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({ success: true });
  });
});

app.get('/api/users', function(req, res) {

    console.log("fetching all users");

    // use mongoose to get all users in the database
    User.find(function(err, users) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err)

        res.json(users); // return all users in JSON format
    });
});

colors = ["#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#34495e", "#16a085", "#27ae60", "#2980b9", "#8e44ad", "#2c3e50", "#f1c40f", "#e67e22", "#e74c3c", "#95a5a6", "#f39c12", "#d35400", "#c0392b", "#bdc3c7", "#7f8c8d"];

function getColor(name){
    let color = colors[Math.floor(Math.random()*colors.length)];

    console.log(color);
    return color;
}

// create user
app.post('/api/user', function(req, res) {

    console.log("creating user", req.body.username, req.body.password);

    User.findOne({
        username: req.body.username
    }, function(err, user) {

        if (err) throw err;

        if (user) 
            errorResponse(res, "Username taken");

        // create a user, information comes from request
        User.create({
            username: req.body.username,
            password: req.body.password,
            phone: req.body.phone,
            color: getColor(req.body.username)
        }, function(err, user) {
            if (err)
                res.send(err);

            res.json(user);
            });
        });  

    
});

//Get user by id
app.get('/api/user/:id', loadResource(User, "User"), function(req, res) {
   res.json(req.resource);
});

// delete a user
app.delete('/api/user/:user_id', function(req, res) {
    User.remove({
        _id : req.params.user_id
    }, function(err, user) {

    });
});

//Join group
app.post('/api/user/join', function(req, res){
    Group.findById(req.body.groupId, function(err, group){
        if(err)
            res.send(err);
       User.findByIdAndUpdate(
            req.body.userId,
            { $addToSet: {"groups": group._id}},
            {safe:true, upsert: true, new:true}, function(err, doc) {
            if (err)
                res.send(err) // handle error;
            
            res.json(group);
        });
    });
});

// Get users groups
app.get('/api/user/:userId/groups', function(req, res) {

    User.findById(req.params.userId,function(err, user) {
        if (err)
            res.send(err)
        
        getObjectsFromIdArray(Group, user.groups).then(function(result){
            res.json(result);
        });
    });
});

//Get Users with group
app.get('/api/users/group/:groupId', function(req, res) {
    getUsersWithGroup(req.params.groupId).then(function(result){
        res.json(result);
    }).catch(function(err){
        res.send(err);
    });
});

function getUsersWithGroup(groupIdP){
    return new Promise(function (resolve, reject){
        console.log(groupIdP);
        // use mongoose to get all users with group code
        User.find({ groups: groupIdP },function(err, users) {

            // if there is an error retrieving, send the error
            if (err)
                reject(err);

            resolve(users);
        });
    });
}

/**
 * Group API
 */ 

// Get Groups
app.get('/api/groups', function(req, res) {

    console.log("fetching all groups");

    // use mongoose to get all groups in the database
    Group.find(function(err, groups) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err)

        res.json(groups); // return all groups in JSON format
    });
});

// create group and send back all groups after creation
app.post('/api/group', function(req, res) {

    console.log("creating group", req.body.name,req.body.admin);

    // create a group, information comes from request from Ionic
    Group.create({
        name : req.body.name,
        admin : req.body.admin,
        code: shortid.generate()
    }, function(err, group) {
        if (err)
            res.send(err);

         User.findByIdAndUpdate(
            group.admin,
            { $addToSet: {"groups": group._id}},
            {safe:true, upsert: true, new:true}, function(err, doc) {
            if (err)
                res.send(err) // handle error;
            
            res.json(group);
        });

       
    });

});

//Get group by id
app.get('/api/group/:id', loadResource(Group, "group"), function(req, res) {
    res.json(req.resource);
});

//Get group by code
app.get('/api/group/code/:code', function(req, res) {
  
    Group.findOne({ code: req.params.code }, function (err, group){
        if(err)
            res.send(err);

        res.json(group);
    });
});

//Add invite
app.get('/api/group/:id/invite/:inviteId', function(req, res) {
   
     Group.findByIdAndUpdate(
        req.params.id,
        { $addToSet: {"invites": req.params.inviteId }},
        {safe:true, upsert: true, new:true}, function(err, doc) {
        if (err)
            res.send(err) // handle error;
        
        res.json(doc);
    });
});


// delete a group
app.delete('/api/group/:group_id', function(req, res) {
    Group.remove({
        _id : req.params.group_id
    }, function(err, group) {
        /*User.update({
            groups: req.params.group_id
        }, {
            '$pull': {
                groups: req.params.group_id
            }
        })*/
        res.json(group);
    });
});

//Get invite by id
app.get('/api/invite/:id', loadResource(Invite, "invite"), function(req, res) {
    res.json(req.resource);
});

// create invite 
app.post('/api/invite', function(req, res) {

    console.log("creating invite");

    // create a workplace, information comes from request from Ionic
    Invite.create({
        group : req.body.group,
        user:  req.body.user,
        date: Date.now()
    }, function(err, invite) {
        if (err)
            res.send(err);
        
        res.json(invite);
    });

});

// delete a invite
app.delete('/api/invite/:invite_id', function(req, res) {
    Invite.remove({
        _id : req.params.invite_id
    }, function(err, invite) {
        res.json(invite);
    });
});

//Going
app.post('/api/invite/going', function(req, res){
    Invite.findByIdAndUpdate(
        req.body.inviteId,
        { $addToSet: {"going": req.body.userId }},
        {safe:true, upsert: true, new:true}, function(err, doc) {
        if (err)
            res.send(err) // handle error;
        
        res.json(doc);
    });
});

// Get Invites
app.get('/api/invites', function(req, res) {

    console.log("fetching all invites");

    // use mongoose to get all invites in the database
    Invite.find(function(err, invites) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err)

        res.json(invites); // return all invites in JSON format
    });
});
// listen
app.listen(8080);
console.log("App listening on port 8080");
