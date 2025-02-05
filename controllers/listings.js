const Listing = require('../models/listing');
const index = async (req, res) => {
    try {
        const listings = await Listing.find({})
        console.log(listings)
        
        res.render('listings/index.ejs', {
            title: 'Listings'
        })
    } catch (error) {
        console.log(error)
        res.redirect('/')
    }
}

const newListing = async (req, res) => {
    res.render('listings/new.ejs', {
        title: 'New'
    })
    
}

const createListing = async (req, res) => {
    console.log(req.body)
    res.redirect('/listings/index')
}

module.exports = {
    index,
    newListing,
    createListing,
}

