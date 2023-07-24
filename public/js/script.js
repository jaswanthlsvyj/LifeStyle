// ====== to Show and hide the navbar ======
$(function(){
    $('#bar').click(function(){
        $('#navbar').addClass("active");
    });
    $('#close').click(function(){
        $('#navbar').removeClass("active");
    });
});

// ======= changes the elements of the signup form =====
$('#newsletterform').submit(function(event) {
    event.preventDefault();
    
    // var email = $('#email').val();

    $.ajax({
      url: '/home',
      method: 'POST',
      data: { email: email },
      success: function(response) {
        $('#newsletterdiv').replaceWith('<h4>Signed up succesfully</h4>');
        // alert(response.message);
      },
      error: function(error) {
        alert('An error occurred while signing up.');
      }
    });
  });

//  index page 
document.getElementById("indexUsername").innerHTML = localStorage.getItem('textvalue');

//  login page 
function passNameValue(){
    var LoginUsername = document.getElementById('loginUsername').value;
    console.log(LoginUsername);
    localStorage.setItem("textvalue",LoginUsername);
    return false;
}