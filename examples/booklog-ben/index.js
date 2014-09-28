/**
 * Module dependencies.
 */

var express = require('../../lib/express');

// Path to our public directory

var pub = __dirname + '/public';

// setup middleware

var app = express(); // app這物件所有index.js裡面都可使用
app.use(express.static(pub));


// Optional since express defaults to CWD/views

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/booklog2');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('MongoDB: connected.');	
});


var postSchema = new mongoose.Schema({
    subject: { type: String, default: ''},
    content: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }

});

var userSchema = new mongoose.Schema({ //Define db schema
    username: { type: String, unique: true },
    displayName: { type: String, unique: true },
    email: { type: String, unique: true },
    timeCreated: { type: Date, default: Date.now },
    facebook: {}
});

app.db = {
	posts: mongoose.model('Post', postSchema),
	users: mongoose.model('User', userSchema)
};


app.set('views', __dirname + '/views'); // 從view folder去讀取頁面，如果沒有就去找render

// Set our default template engine to "jade"
// which prevents the need for extensions
// (although you can still mix and match)
app.set('view engine', 'jade');

function User(name, email) {
  this.name = name;
  this.email = email;
}

// Dummy users
var users = [
    new User('tj', 'tj@vision-media.ca')
  , new User('ciaran', 'ciaranj@gmail.com')
  , new User('aaron', 'aaron.heckmann+github@gmail.com')
];



/*var posts = [];

var postcontent = [{
	subject: "subject",
	content: "content"
},{
	subject: "Hello",
	content: "hi"
}]; */

var bodyParser = require('body-parser'); //require等於import events class，因為他是外部模組(npm body-parser模組)
app.use(bodyParser.urlencoded({
	extended: true
	}));

var count = 0;

 //2014.9.27 -start
var session = require('express-session');
var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;

app.use(session({ secret: 'keyboard cat' })); 
//app.use 為 middleware 概念，函數會自動判斷是否通過，通過函數裡面會自動下next()
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


passport.use(new FacebookStrategy({
    clientID: '476495939156713',
    clientSecret: '59632e5641297193a0323bf25a7ebcef',
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) { 
  //Lambda寫法 可以把這函數放在第二顆ＣＰＵ，非同步，上面的ＵＳＥ可能會在第一顆ＣＰＵ跑
	   app.db.users.findOne({"facebook._json.id": profile._json.id}, function(err, user) {
		   	if (!user) { //判斷資料庫有無此ＵＳＥＲ，有就不儲存了
			  var obj = {
			    username: profile.username,
			    displayName: profile.displayName, //author name
			    email: '',
			    facebook: profile
			   };

			   var doc = new app.db.users(obj);
		   	   doc.save();

		   	   user = doc;
		   	}

		   	return done(null, user); // verify
	   });
  }
));

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/login' }));
//2014.9.27 end


app.all('*', function(req, res, next){
  if (!req.get('Origin')) return next();
  // use "*" here to accept any origin
  res.set('Access-Control-Allow-Origin', '*'); //set http header 可以允許不同網域的人來讀取此網頁
  res.set('Access-Control-Allow-Methods', 'PUT');
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  // res.set('Access-Control-Allow-Max-Age', 3600);
  if ('OPTIONS' == req.method) return res.send(200);
  next();
});

app.get('/', function(req, res, next) {
	if (req.isAuthenticated()) {
		next();
	} else {
		res.render('login');
	}
});

app.get('/', function(req, res) {
	res.render('index');
});

//app.all('*', function(req, res, next){ //app.all不管所有協定都去跑，*代表所有url也是
	//console.log('count'+count++);//計算瀏覽次數
	/*if (req.headers.host === 'localhost:3000') {
		console.log("Access denied"); //阻止其他人去讀下面的API
	}
	else {
		next(); //告訴express此條件成立，繼續往下比較路徑
	}*/
	
//});



app.get('/download', function(req, res){ //此命名風格為網頁
	var events = require('events'); // require等於import events class，因為他是外部模組
	var workflow = new events.EventEmitter(); //載入到記憶體中，類別實例化

	workflow.outcome = {  //outcome 為一物件
		success: false // tag & value
	};

	workflow.on('validate', function(){  //開始設定workflow狀態檢查
		var password = req.query.password;  
		//在用API打時，url需要打成這樣http://localhost:3000/download?password=123456

		if (password === '123456'){
			return workflow.emit('success'); //emitter.emit(event, [arg1], [arg2], [...])方法
			
		};
		return workflow.emit('error');
	});

	workflow.on('success', function(){
		workflow.outcome.success = true;
		workflow.outcome.redirect = {
			url: '/weclome'
		};
		workflow.emit('response');
	});

	workflow.on('error', function(){
		count ++; 
		workflow.outcome.success = false;
		workflow.emit('response');
	});

	workflow.on('response', function() {
		console.log('count'+count);
		if (count ===3) {
			res.send(workflow.outcome);
			console.log("吃屎吧");
		}else{
			res.send(workflow.outcome);
			
		};
		});
		return workflow.emit('validate');
	});



/*app.get('/welcome', function(req, res){ 
	res.render('index'); //從view folder讀取index.jade檔案
	
}); */

app.get('/post', function(req, res){
	res.render('post',{
		post: postcontent
	}); //從view folder讀取post.jade檔案
	
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/1/post/:id', function(req, res) {	
	var id = req.params.id;
	var posts = req.app.db.posts;

	posts.findOne({_id: id}, function(err, post) {
		res.send({post: post});	
	});
});

app.get('/1/post/tag/:tag', function(req, res) {	
	var tag = req.params.tag;
	var posts = req.app.db.posts;

	posts
    .find( { $text: { $search: tag } } )
    .exec(function(err, posts) {
    	if (err) return console.log(err);
        res.send({posts: posts});
    });
});

/*
app.get('/1/post/tag/:tag', function(req, res) {	
	var tag = req.params.tag;
	app.db.user.findOne();
	// TBD:
	console.log("SEARCHING...");
});
*/

app.get('/1/post', function(req, res) {	
	var posts = req.app.db.posts;

	posts
	.find()
	.populate('userId')
	.exec(function(err, posts) {
		res.send({posts: posts});	
	});
});


app.post('/1/post', function(req, res, next) {
	if (req.isAuthenticated()) {
		next();
	} else {
		res.render('login');
	}
});

/*
//此命名風格為API，只回傳給JSON
app.get('/1/post', function(req, res){
//call back function，前面行為set url執行完，再將後面匿名函數當作參數執行，req為express所給的物件
	var posts = req.app.db.posts;

	posts.find(function(err, posts) {
		res.send({posts: posts});	
	});

	/*var result = {
		titl: "Test",
		content: "Foo"
	}; //{}為JS的物件 */
	//res.send({post: posts});	
	//res.send(result);
//}); 

app.post('/1/post', function(req, res) {
	var posts = req.app.db.posts;
	var userId = req.user._id;

	var subject;
	var content;

	if (typeof(req.body.subject) === 'undefined') {
		subject = req.query.subject;
		content = req.query.content;
	} else {
		subject = req.body.subject;
		content = req.body.content;		
	}

	var data = {
		userId: userId,
		subject: subject,
		content: content
	};

	var post = new posts(data);
	post.save();

	res.send({ status: 'OK'});
});

	/*var subject;
	var content;
	
	if (typeof(req.body) === 'undefined') { //型態與字串要相等
		subject = req.query.subject; //讀request body 裡面 key為subject的值
		content = req.query.content; //讀request body 裡面 key為content的值
	};
	console.log(req.body);
	var post = {
		subject: subject,
		content: content
	};
	
	var card = new posts(post); //new 一個目錄posts下new一個新檔案，裡面放post內容
	card.save(); //save完mongodb會自動產生一筆id



	posts.push(post); 
	res.send({status:'ok', posts:post}); */
 

/*app.post('/1/post', function(req, res){ // app.post為rest post 方法
	var result = {
		titl: "Test",
		content: "post"
	}; //{}為JS的物件
	res.send(result);
});  */

app.put('/1/post/:postId', function(req, res){ //uri :後面代的為參數
	var id = req.params.postId;
	var posts = req.app.db.posts;

	posts.findOne({_id: id}, function(err, post) {
		res.send({post: post});	
	});
	//res.send("updated a post"+id);

	/*var result = {
		titl: "Test",
		content: "put"
	}; //{}為JS的物件
	res.send(result); */
}); 




app.delete('/1/post', function(req, res){
	var posts = req.app.db.posts;

	posts.find(function(err, posts) {
		res.send({posts: posts});	
	});


	/*var result = {
		titl: "Test",
		content: "delete"
	}; //{}為JS的物件
	res.send(result);*/
}); 
// change this to a better error handler in your code
// sending stacktrace to users in production is not good
app.use(function(err, req, res, next) {
  res.send(err.stack);
});

/* istanbul ignore next */
if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}
