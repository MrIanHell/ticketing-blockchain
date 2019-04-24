// Set data values to prepare form's POST request
const address = 'http://localhost:5000'
$("#create-event-form").attr("action", address + '/events')

// Setting up auth header from client's saved jwt for requests
$.ajaxSetup({
    headers: { 'Authorization': Cookies.get('jwt') }
})

// Set minimum date attribute on date input element
let today = new Date()
let dd = today.getDate()
let mm = today.getMonth() + 1
const yyyy = today.getFullYear()

if (dd < 10) {
    dd = '0' + dd
}
if (mm < 10) {
    mm = '0' + mm
}

today = yyyy + '-' + mm + '-' + dd
$("#event-date").attr("min", today)


// Function to convert form data to JSON
$.fn.serializeToJSON = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

// Send POST request to /events endpoint using form data to create an event
$("#create-event-form").submit(e => {
    $('#pageloader').css('visibility', 'visible')
    e.preventDefault(); // avoid to execute the actual submit of the form.

    const form = $("#create-event-form")
    const url = form.attr('action')

    // Set up form data to be sent in request
    const formData = form.serializeToJSON()
    formData['date'] = new Date(formData['date'] + ' ' + formData['time']).toISOString() // format date and time
    delete formData['time']

    $.ajax({
        type: "POST",
        url: url,
        data: formData,
    }).done(data => {
        $('#response-message').removeClass()
        $('#response-message').addClass('success-message')
        $('#response-message').text('Event has been successfully created and its '
            + 'smart contract contract has been deployed')
        $('#pageloader').css('visibility', 'hidden')
    }).fail((jqXHR, textStatus, errorThrown) => {
        $('#response-message').removeClass()
        $('#response-message').addClass('error-message')
        if (errorThrown == 'Unauthorized') {
            $('#response-message').text('Please log in to create an event')
        } else if (jqXHR.responseText) {
            $('#response-message').text(jqXHR.responseText)
        }
        else {
            $('#response-message').text('Internal server error')
        }
        $('#pageloader').css('visibility', 'hidden')
    })


})