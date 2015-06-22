var express = require('express');
var bodyParser = require('body-parser');
var jwt = require('jwt-simple');
var _ = require('lodash');
var bcrypt = require('bcrypt');
var User = require('./user');
var app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

var users = [{username:'suthaw',password: bcrypt.hashSync('admin123',10)}];


var secretKey = 'supersecretKey';

app.post('/user',function(req,res){
	var user = new User({username:req.body.username});
	bcrypt.hash(req.body.password,10,function(err,hash){
		user.password = hash;
		user.save(function(err,user){
			console.log(user);
			if(err) throw(err);
			res.send(201);
		});
	})
});


app.post('/session',function(req,res,next){
	User
		.findOne({username:req.body.username})
		.select('password')
		.exec(function(err,user){
			if(err) next(err);
			if(!user) return res.send(401);
			bcrypt.compare(req.body.password,user.password,function(err,valid){
				if(err || !valid) return res.send(401);
				console.log(user);
				var token = jwt.encode({username:req.body.username},secretKey);
				res.json(token);
			});
		});

});

app.get('/user',function(req,res){
	var token = req.headers['x-auth'];
	var user = jwt.decode(token,secretKey);
	console.log(user);
	User.findOne({username:user.username},function(err,user){
		if(err) throw(err);
		res.json(user);
	});
});

app.listen(3000);
