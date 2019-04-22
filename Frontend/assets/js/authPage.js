const backendAddress = 'http://localhost:5000'


// Toggle between log in and sign up form
$('#sign-up-msg a').click(e => {
    e.preventDefault()
    $('form').animate({ height: "toggle", opacity: "toggle" }, "slow")
})

// Set data values in forms to prepare forms' POST requests
$("#login-form").attr("action", backendAddress + '/auth/login')
$("#signup-form").attr("action", backendAddress + '/auth/signup')

// Send POST request to /auth/login endpoint using form data to log in user
$("#login-form").submit(e => {
    $('#pageloader').css('visibility', 'visible')
    e.preventDefault() // avoid to execute the actual submit of the form

    const form = $("#login-form")
    const url = form.attr('action')

    $.ajax({
        type: "POST",
        url: url,
        data: form.serialize(), // serializes the form's elements.
    }).done(data => {
        $('#response-message').removeClass()
        $('#response-message').addClass('success-message')
        $('#response-message').text('Log In Successful!')

        // Saving JWT in cookie
        Cookies.set('jwt', 'Bearer ' + data['token'])

        $('#pageloader').css('visibility', 'hidden')
    }).fail((jqXHR, textStatus, errorThrown) => {
        $('#response-message').removeClass()
        $('#response-message').addClass('error-message')
        if (errorThrown == 'Unauthorized') {
            $('#response-message').text('Incorrect email or password')
        } else if (jqXHR.responseJSON['message']) {
            $('#response-message').text(jqXHR.responseJSON['message'])
        }
        else {
            $('#response-message').text('Internal server error')
        }
        $('#pageloader').css('visibility', 'hidden')
    })
})

// Send POST request to /auth/login endpoint using form data to log in user
$("#signup-form").submit(e => {
    e.preventDefault() // avoid to execute the actual submit of the form

    const form = $("#signup-form")
    const url = form.attr('action')
  
    // Validate passwords are the same
    const password = $('#password').val()
    const confPassword = $('#confirm-password').val()
    if (password != confPassword) {
        $('#response-message-2').addClass('error-message')
        $('#response-message-2').text('Passwords do not match')
        return
    }

    $('#pageloader').css('visibility', 'visible')

    $.ajax({
        type: "POST",
        url: url,
        data: form.serialize(), // serializes the form's elements.
    }).done(data => {
        $('#response-message-2').removeClass()
        $('#response-message-2').addClass('success-message')
        $('#response-message-2').text('Sign Up Successful!')
        $('#pageloader').css('visibility', 'hidden')
    }).fail((jqXHR, textStatus, errorThrown) => {
        $('#response-message-2').removeClass()
        $('#response-message-2').addClass('error-message')
        if (errorThrown == 'Unauthorized') {
            $('#response-message-2').text('Incorrect email or password')
        } else if (jqXHR.responseJSON['message']) {
            $('#response-message-2').text(jqXHR.responseJSON['message'])
        }
        else {
            $('#response-message-2').text(jqXHR.responseText)
        }
        $('#pageloader').css('visibility', 'hidden')
    })
})