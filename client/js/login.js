/**
 * Created by haspa on 20.04.17.
 */
    //sign
var socket = io();
var WIDTH = 500;
var HEIGHT = 500;

var signDiv = document.getElementById('signDiv');
var signDivUsername = document.getElementById('signDiv-username');
var signDivSignIn = document.getElementById('signDiv-signIn');
var signDivSignUp = document.getElementById('signDiv-signUp');
var signDivPassword = document.getElementById('signDiv-password');

var gameDiv = document.getElementById('gameDiv');

signDivSignIn.onclick = function () {
    socket.emit('signIn', ({username:signDivUsername.value, password:signDivPassword.value}));
};

socket.on('signInResponse', function (data) {
    if(data.success){
        signDiv.style.display = 'none';
        gameDiv.style.display = 'inline-block';
    }else{
        alert('Sign in not successful!');
    }
});

signDivSignUp.onclick = function () {
    socket.emit('signUp', ({username:signDivUsername.value, password:signDivPassword.value}));
};

socket.on('signUpResponse', function (data) {
    if(data.success){
        alert('Sign up successful!');
    }else{
        alert('Sign up not successful!');
    }
});