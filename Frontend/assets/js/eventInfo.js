// Extract event id from URL
const urlParams = new URLSearchParams(window.location.search)
const eventID = urlParams.get('id')
const address = 'http://localhost:5000'

// Setting up auth header from client's saved jwt for requests
$.ajaxSetup({
    headers: { 'Authorization': Cookies.get('jwt') }
})

// Make a GET request to our backend API
$.getJSON(address + '/events/' + eventID, (eventData) => {
    $('#event-title').replaceWith('<h2>' + eventData['name'] + '</h2>') // Replace title

    // Replace subtitle with event date
    const date = new Date(eventData['date'])
    const formattedDate = date.toDateString()
    const formattedTime = date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes()
    $('#date-title').replaceWith('<p>' + formattedDate + ' ' + formattedTime + '</p>')

    // Write out event information
    $('#event-info').html('<strong>Date:</strong> ' + formattedDate)
    $('#event-info').append('<br /><strong>Time:</strong> ' + formattedTime)
    $('#event-info').append('<br /><strong>Ticket Face Value:</strong> £' + eventData['faceValue'].toFixed(2))
    $('#event-info').append('<br /><strong>Remaining Tickets:</strong> ' + (eventData['totalTickets'] - eventData['ticketsSold']))
    $('#event-info').css('font-size', '14pt')
    $('#event-info').css('line-height', '30px')
    $('#event-desc').html(eventData['description'])
    $('#event-desc').css('font-style', 'italic')

    // Calculate ticket price based on quantity entered
    const totalPrice = $("#ticket-quantity").val() * eventData['faceValue']
    $("#ticket-price").html('<strong>Total Price:</strong> £' + totalPrice.toFixed(2))
    $("#ticket-quantity").on("change keyup paste", () => {
        const totalPrice = $("#ticket-quantity").val() * eventData['faceValue']
        $("#ticket-price").html('<strong>Total Price:</strong> £' + totalPrice.toFixed(2))
    })

    // Set data values to prepare form's POST request
    $("#eventID").attr("value", eventID)
    $("#buy-tickets-form").attr("action", address + '/tickets/buy')

})

// Send POST request to /tickets/buy endpoint using form data to buy ticket(s)
$("#buy-tickets-form").submit(e => {
    $('#pageloader').css('visibility', 'visible')
    e.preventDefault(); // avoid to execute the actual submit of the form.

    const form = $("#buy-tickets-form")
    const url = form.attr('action')
    $.ajax({
        type: "POST",
        url: url,
        data: form.serialize(), // serializes the form's elements.
    }).done(data => {
        $('#response-message').removeClass()
        $('#response-message').addClass('success-message')
        $('#response-message').text('Purchase successful!')
        $('#pageloader').css('visibility', 'hidden')
    }).fail( (jqXHR, textStatus, errorThrown) => {
        $('#response-message').removeClass()
        $('#response-message').addClass('error-message')
        if (errorThrown == 'Unauthorized') {
            $('#response-message').text('Please log in to buy tickets')
        } else if (jqXHR.responseJSON['message']) {
            $('#response-message').text(jqXHR.responseJSON['message'])
        }
        else {
            $('#response-message').text('Internal server error')
        }
        $('#pageloader').css('visibility', 'hidden')
    })


})