//we can add this to any route to protect it
module.exports={
    ensureAuthenticated: function(req,res,next){
        if(req.isAuthenticated()) return next();
        console.log('It looks like we need to get you logged in.')
        res.redirect('/login')
    }
}