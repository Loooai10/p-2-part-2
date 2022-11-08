const express = require('express')
const db = require('../models')
const router = express.Router()
const request = require('request')
const cryptojs = require('crypto-js')
require('dotenv').config()
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')
let  recipeUrl = '';
let encoded = '';

router.get('/', function(req, res) {
	db.favorite.count({where: {userId: user.id}}).then(function(data) {
		console.log('this is the data passed back', data)
		if (data === 0) {
			$('#no-recipes').attr('display', 'none');
		};
	});
});
//edits the user's profile information
router.get('/edit/:id', function(req, res){
	db.user.findById(req.params.id).then(function(user) {
		res.render('profile/edit', {user: user});
	});
});

router.post('/add', async (req,res) => {
    console.log(req.body.id)

	res.send('this route works!')
})

//puts the new edited profile info on the profile page
router.put('/new/:id', function(req, res) {
	db.user.update({
		where: {id: req.params.id}
	}).then(function(user) {
		res.send('success');
	}).catch(function(error) {
		console.log(error);
	});
});

//adds a recipe to the favorites by gathering info
//from the hidden form values on all.ejs and then 
//it splits the ingredients into an array 
//and reloads the search page 
router.post('/', function(req, res) {
	db.favorite.create({
	    label: req.body.label,
	    imgUrl: req.body.image,
	    ingredients: req.body.ingredients.split(','),
	    url: req.body.url,
	    uri: req.body.uri,
	    userId: req.user.id
	}).then(function(data) {
		// console.log(data);
		res.redirect('back');
	}).catch(function(error) {
		console.log('this is the error ' + error);
	});
});

//deletes specific recipe
router.delete('/:label', function(req, res) {
	db.favorite.destroy({
		where: {label: req.params.label}
	}).then(function(data) {
		res.send('');
	});
});

router.post('/:recipeId/new', async (req,res) => {
// Grab our recipe
const recipe = await db.recipe.findByPk(req.params.recipeId)
// Create a comment
const [newComment, created] = await db.comment.findOrCreate({
    where: {
        description: req.body.description
    }
})
//Add our comment to the recipe
await recipe.addComment(newComment)
await res.locals.user.addComment(newComment)
//redirect to recipe details page
res.redirect(`/recipe/${req.params.recipeId}`)
})



module.exports = router