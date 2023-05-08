

function validate() {
    
    var username=document.getElementById('username').value
    var email=document.getElementById('email').value
    var mobile=document.getElementById('mobile').value
    var password=document.getElementById('password').value
    //var cpassword=document.getElementById('spassword').value
    
    if(!username.trim()||username===""){
        document.getElementById('checkUsername').innerHTML="please enter the valid data"
        return false;
   }else{
     true;
        
    }


}
