

import fs from 'fs'
fs.unlink('./index.html',(err,res) => {
    if(err) return console.log(err)
    return
})