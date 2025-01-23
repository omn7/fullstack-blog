const express = require('express');
const app = express();
const path = require('path');
const User = require('.models/user');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Post = require('./models/post');
const { name } = require('ejs');
// Set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('views', path.join(__dirname, 'views'));
app.use(cookieParser());

// Define a route for the home page
app.get('/', (req, res) => {
    res.render('index');
});
app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/profile', isLoggedIn, async (req, res) => {
    let user = await User.findOne({email: req.user.email}).populate('posts');
    
    res.render('profile', {user: user});

});
// app.get('/blog', async (req, res) => {
//     let posts = await Post.find({});
//     res.render('blog', { posts: posts });
// });




app.post('/register', async (req, res) => {
    let { username, password, email, name } = req.body;
    let existingUser = await User.findOne({ email: email });
    if (existingUser) {
        return res.send('User already exists');
    }
    bcrypt.hash(password, 10, async (err, hash) => {
        if (err) {
            return res.send('Error hashing password');
        }
        let newUser = await User.create({
            username: username,
            password: hash,
            email: email,
            name: name
        });
        jwt.sign({ email: email, user: newUser._id }, 'secret', (err, token) => {
            if (err) {
                return res.send('Error creating token');
            }
            res.cookie('token', token);
            
            res.redirect('profile');
        });
    });
});

app.post('/post', isLoggedIn, async (req, res) => {
    let user = await User.findOne({email: req.user.email});
    let { content } = req.body;
let newPost = await Post.create({
        content: content
    });

    user.posts.push(newPost._id);
    await user.save();
    res.redirect('/profile');
});



app.post('/login', async (req, res) => {
    let { password, email} = req.body;
    let existingUser = await User.findOne({ email: email });

    if (!existingUser) {
        return res.send('something wend wrong');
    }
    bcrypt.compare(password, existingUser.password, (err, result) => {
  
        if(result){
            let token = jwt.sign({ email: email, user: existingUser._id }, "secret");
            res.cookie('token', token);
            res.redirect('/profile');
        
        }
        else{
           res.send('Wrong password');
        }
        
   });
    });

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

function isLoggedIn(req, res, next) {
  if (!req.cookies.token) {
    return res.redirect('/login');
  }
  try {
    let data = jwt.verify(req.cookies.token, 'secret');
    req.user = data;
    next();
  } catch (err) {
    return res.redirect('/login');
  }
}
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});