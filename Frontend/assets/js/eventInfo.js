// Extract event id from URL
const urlParams = new URLSearchParams(window.location.search)
const eventID = urlParams.get('id')
const address = 'http://localhost:5000'

// Hide loading gif then show it when form is submitted
$('#pageloader').hide()

$('#buy-tickets-form').submit(() => {
    $('#pageloader').show()
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
    $('#event-info').append('<br /><strong>Remaining Tickets :</strong> ' + (eventData['totalTickets'] - eventData['ticketsSold']))
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

    // Set data values to prepare from POST request
    $("#eventID").attr("value", eventID)
    $("#buy-tickets-form").attr("action", address + '/tickets/buy')

})