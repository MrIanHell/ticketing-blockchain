const address = 'http://localhost:5000'
$('#pageloader').css('visibility', 'visible') // Show loading screen whilst fetching tickets

// Setting up auth header from client's saved jwt for requests
$.ajaxSetup({
    headers: { 'Authorization': Cookies.get('jwt') }
})

// Make GET request to fetch tickets owned by authenticated user from the backend layer
$.getJSON(address + '/tickets/', (ticketsData) => {
    $('#pageloader').css('visibility', 'hidden')
    $('#subheading-message').text(ticketsData['message'])

    console.log(ticketsData)
    ticketsData['tickets'].forEach(ticket => {
        const cell = $('<div class="col-4 col-12-medium"></div>')

        // Create ticket info highlight section
        const ticketInfo = $('<section class="highlight"></section>')
        ticketInfo.attr('style', 'border: solid 3px; padding: 1em; background: #f3f3f3 url("images/overlay.png");')

        // Create heading of event the ticket is for
        const heading = $('<h3>' + ticket['eventName'] + '</h3>')
        heading.css('font-size', '1.4em')

        // Get quantity of tickets user owns
        const quantity = $('<p >Quantity owned: ' + ticket['quantityOwned'] + '</p>')

        // Append all created elements with contained ticket information to DOM
        $('#row').append(cell)
        cell.append(ticketInfo)
        ticketInfo.append(heading)
        ticketInfo.append(quantity)
        ticketInfo.qrcode({ text: JSON.stringify(ticket), size: 100 }) // Generate QR code with ticket info

    })
}).fail((jqXHR, textStatus, errorThrown) => {
    if (errorThrown == 'Unauthorized') {
        $('#subheading-message').text('Please log in to buy tickets')
    } else if (jqXHR.responseJSON['message']) {
        $('#subheading-message').text(jqXHR.responseJSON['message'])
    }
    else {
        $('#subheading-message').text('Internal server error')
    }
    $('#pageloader').css('visibility', 'hidden')
})