
module.exports = {
  
  isBlank: function(str){
    if(!str) return true;
    if(str == null || str == '') return true;
    return false;
  },

  isNotBlank: function(str){
    return !this.isBlank(str);
  }

};