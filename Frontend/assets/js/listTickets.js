const address = 'http://localhost:5000'
$('#pageloader').css('visibility', 'visible') // Show loading screen whilst fetching tickets

// Setting up auth header from client's saved jwt for requests
$.ajaxSetup({
    headers: { 'Authorization': Cookies.get('jwt') }
})

$.getJSON(address + '/auth', (authInfo) => {
    $("#eth-acc-addr").html('<strong>Ethereum Account Address: <br class="mobile-hide" /></strong>' + authInfo['accAddress'])
    $("#acc-addr-qr").qrcode({ text: authInfo['accAddress'] }) // Generate QR code with acc addr
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

        // Generate qr code and its div
        const qrCodeContent = { text: JSON.stringify(ticket), size: 100 }
        const qrCode = $('<div id="ticket-qr" style="margin-bottom: 1em;"></div>').qrcode(qrCodeContent)
        qrCode.hide()

        // Create sell and view qr code buttons
        const buttonDiv = $('<div style="text-align: center;"></div>')
        const sellButton = $('<button class="button style1">Sell</button>')
        const qrButton = $('<button class="button style2">Ticket QR</button>')
        const buttonCSS = 'height: 3.5em; width: auto; line-height: 3.5em; font-size: 0.75em; margin: 3px; display: inline-block;'
        sellButton.attr('style', buttonCSS)
        qrButton.attr('style', buttonCSS)
        buttonDiv.append(sellButton)
        buttonDiv.append(qrButton)

        // Construct the sell tickets form
        const sellTicketsForm = $('<form method="post" action=' + address + '/tickets/sellListings' + '></form>')
        const ticketQuantity = $('<input type="number" min="1" name="quantity" placeholder="Ticket Quantity to Sell" required/>')
        const resalePrice = $('<input type="number" min="0" step="0.01" name="sellPrice" placeholder="Sell Price per Ticket (£)" required/>')
        const hiddenEventID = $('<input type="hidden" name="eventID" value="' + ticket['eventID'] + '" />')
        const fillerDiv = $('<div></div>')
        const submitButton = $('<input type="submit" class="style3" value="Create Sell Listing" />')
        const responseMessage = $('<p id="response-message" style="margin-top: 0.75em;"></p>')
        const submitButtonCSS = 'height: auto; width: 150px; line-height: 1.5em; font-size: 0.75em; margin-top: 1.5em;'
            + 'padding: 0.5em; display: inline-block; white-space: normal;'
        const inputCSS = 'margin: 3px; width: auto; display: inline-block;'
        sellTicketsForm.attr('style', 'width: auto; margin-top: 25px;')
        submitButton.attr('style', submitButtonCSS)
        ticketQuantity.attr('style', inputCSS)
        resalePrice.attr('style', inputCSS)
        sellTicketsForm.append(ticketQuantity)
        sellTicketsForm.append(resalePrice)
        sellTicketsForm.append(hiddenEventID)
        sellTicketsForm.append(fillerDiv)
        sellTicketsForm.append(submitButton)
        sellTicketsForm.append(responseMessage)
        sellTicketsForm.hide()

        // When form is submitted send POST request to /tickets/sellListings endpoint
        // using form data to create a sell listing for the user
        sellTicketsForm.submit(e => {
            $('#pageloader').css('visibility', 'visible')
            e.preventDefault();

            $.ajax({
                type: "POST",
                url: sellTicketsForm.attr('action'),
                data: sellTicketsForm.serialize(),
            }).done(data => {
                responseMessage.removeClass()
                responseMessage.addClass('success-message')
                responseMessage.text('The sell listing has been successfully created')
                $('#pageloader').css('visibility', 'hidden')
            }).fail((jqXHR, textStatus, errorThrown) => {
                responseMessage.removeClass()
                responseMessage.addClass('error-message')
                if (errorThrown == 'Unauthorized') {
                    responseMessage.text('Please log in to create an event')
                } else if (jqXHR.responseJSON['message']) {
                    responseMessage.text(jqXHR.responseJSON['message'])
                } else if (jqXHR.responseJSON['error']) {
                    responseMessage.text(jqXHR.responseJSON['error'])
                }
                else {
                    responseMessage.text('Internal server error')
                }
                $('#pageloader').css('visibility', 'hidden')
            })
        })

        // Functionality for both buttons
        qrButton.click(e => {
            qrCode.toggle('fast')
        })
        sellButton.click(e => {
            sellTicketsForm.toggle('fast')
        })

        // Append all created elements with contained ticket information to DOM
        $('#row').append(cell)
        cell.append(ticketInfo)
        ticketInfo.append(heading)
        ticketInfo.append(quantity)
        ticketInfo.append(qrCode)
        ticketInfo.append(buttonDiv)
        ticketInfo.append(sellTicketsForm)

    })
}).fail((jqXHR, textStatus, errorThrown) => {
    $('#pageloader').css('visibility', 'hidden')
    if (errorThrown == 'Unauthorized') {
        $('#subheading-message').text('Please log in to view your tickets')
    } else if (jqXHR.responseJSON['message']) {
        $('#subheading-message').text(jqXHR.responseJSON['message'])
    }
    else {
        $('#subheading-message').text('Internal server error')
    }
})