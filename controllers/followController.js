const Follow = require("../models/Follow")

exports.addFollow = function(req,res) {
    let follow = new Follow(req.params.username, req.visitorId)
    // create a new follow document in database
    // with info that x user is following y user
    follow.create().then(()=>{
        req.flash("success", `Successfully followed ${req.params.username}`)
        req.session.save(()=> res.redirect(`/profile/${req.params.username}`))
    }).catch((errors)=>{
        errors.forEach( error => {
            req.flash("errors", error)
        })
        req.session.save(()=> res.redirect('/'))
    })


}