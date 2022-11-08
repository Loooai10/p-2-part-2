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

router.get('/home/:recipeLabale', (req,res) => {
	

	res.send('this is the')
})

router.get('/new', (req, res)=>{
    res.render('users/new.ejs')
})
router.get('/', function(req, res) {
	let recipe = null;
	 queryString = req.query.search;
	let healthOption = req.query.selectionbox;

	//encodeURI() 
	if (!(healthOption === 'null')) {
		recipeUrl = 'https://api.edamam.com/search?app_id=' + process.env.API_ID + '&app_key=' + process.env.API_KEY + '&q=' + queryString + '&health=' + healthOption + '&to=100';
	} else {
		recipeUrl = 'https://api.edamam.com/search?app_id=' + process.env.API_ID + '&app_key=' + process.env.API_KEY + '&q=' + queryString + '&to=100';
	};
    request(recipeUrl, function(error, response, body) {
    	try {
    		recipe = JSON.parse(body);
			// console.log(recipe)
            // console.log('json api data', recipe.hits[0])
			recipe.hits.forEach(r => {
				r.recipe.calories = Math.floor(r.recipe.calories)
				r.recipe.yield = Math.floor(r.recipe.yield)
				r.recipe.calPerServ = Math.floor(r.recipe.calories/r.recipe.yield)
			})
            res.render('recipes/favorites', { recipe });
    	} catch(err) {
            console.log('oop! there was an issue restrieving API', err)
            res.json(err)
          }
    })
})


router.post('/new', async (req,res) => {
    console.log('req.body ', req.body)
    //Find user
    // let user = await db.user.findByPk(res.locals.user.id)
    let user = res.locals.user
    console.log(user);
    //Create recipe
    let [newRecipe, created] = await db.recipe.findOrCreate({
        where: {
            labal: req.body.labal
            // ingredients: req.body.ingredients,
            // imgUrl: req.body.imgUrl,
            // url: req.body.url,
            // uri: req.body.uri,
        }
    })
    //Associate recipe to user
    await user.addrecipe(newRecipe)
    let recipe = await db.recipe.findByPk(newRecipe.id)
    // res.json(poke)
    res.redirect('/recipe/favorites')
})


// GET /recipe/favorites ——> favourites.ejs

router.get('/favorites', async (req,res) => {
// Grab users' recipe data
// let user = await db.user.findByPk(res.locals.user.id)
    // let user = res.locals.user
    //wait for DB to return data before moving on
    let userRecipes = await res.locals.user.getRecipes()
    // console.log('user recipes', userRecipes)
    // res.json(userRecipes)
    res.render('recipes/favorites', {userRecipes})
})


// (Form) DELETE /recipe/delete —> redirect to /recipe/favorites

router.delete('/:recipeId', async (req,res) => {

    //We need to delete recipe with id recipeId
    //look at previous code/labs/hw/lessons
    //Search on google ---> delete item/data using sequelize
    await db.recipe.destroy({
        where: { id: req.params.recipeId }
    })
    res.redirect('recipes/favorites')
})


// (Link) GET /recipe/:id ——> details.ejs

router.get('/:recipeId', async (req,res) => {

// Get Details of ONE recipe

let recipe = await db.recipe.findOne({
    where: { id : req.params.recipeId},
    include: [db.comment]
})

// let recipeAndComments = recipe.getComments()
// res.json(pokemon)
res.render('recipes/details.ejs', {recipe})
})


module.exports = router