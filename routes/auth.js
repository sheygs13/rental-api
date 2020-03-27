const {User} = require('../models/user');
const Joi = require('@hapi/joi');
const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcrypt');
const config = require('config');
const jwt = require('jsonwebtoken');
const router = express.Router();


router.post('/', async (req, res) => {
 const { email, password } = req.body;
 const { error } = validate({ email, password });
 if (error) return res.status(400).send(error['details'][0].message)
 let user = await User.findOne({ email });
 if (!user) return res.status(400).json({ message: 'Invalid Email.' });
 const validPassword = await bcrypt.compare(password, user.password);
 if (!validPassword) return res.status(400).json({ message: 'Invalid Password.' });
                         // payload       //secret key
 const token = jwt.sign({  _id: user._id, isAdmin: user.isAdmin }, config.get('jwtPrivateKey'));

 res.send(token);
});

function validate(req) {
 const schema = Joi.object({
   email: Joi.string().min(5).max(255).email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
   password: Joi.string().min(5).max(255).required()
 });

 return schema.validate(req);
}

module.exports = router;