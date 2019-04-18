# importing the requests library 
import requests
import json
import random

# API host address
URL = "http://localhost:5000"


# CREATING USERS
print("Creating Users...")

# User data to be sent to api 
user1 = {'email': 'user1@test.com', 
        'password': 'user1' } 
user2 = {'email': 'user2@test.com', 
        'password': 'user2' } 
user3 = {'email': 'user3@test.com', 
        'password': 'user3' } 
user4 = {'email': 'user4@test.com', 
    'password': 'user4' } 
user5 = {'email': 'user5@test.com', 
    'password': 'user5' }
userList = [user1, user2, user3, user4, user5]

# sending post requests
for user in userList:
    r = requests.post(url = URL + '/auth/signup', data = user)
    print(r.text)


# AUTHENTICATING USERS
print("\nAuthenticating users...")
jwtTokens = []
for user in userList:
    r = requests.post(url = URL + '/auth/login', data = user)
    jwtToken = json.loads(r.text)['token']
    jwtTokens.append(jwtToken)


# CREATING EVENTS
fillerDesc = 'Lorem ipsum dolor sit amet, ad eam dolore prodesset. Ei aliquip aperiam vel, in mea singulis abhorreant. Tantas luptatum nam cu, cu tibique ancillae patrioque eam. Vel diam veniam pericula ea. Meliore erroribus definitiones ne cum. An incorrupte persequeris mel, case dicit nemore eam id. Doming mentitum expetenda no sed, an fastidii electram elaboraret eos. Mea in partem dolorem. Purto aeque eirmod mel et, quaeque phaedrum est et, eu cum idque dissentias. Luptatum democritum elaboraret id nam, eum veritus epicuri legendos ne.'
gambinoDesc = 'Childish Gambino is the alter ego of multi-hyphenate American entertainer Donald Glover, who is also known for acting roles on television shows like Community and the Emmy- and Golden Globe-winning Atlanta, as well as the film Solo: A Star Wars Story. As Childish Gambino, Glover refined his off-kilter brand of hip-hop on his 2013 breakthrough album Because the Internet, before making a sharp turn toward R&B-inspired funk, which won him a Grammy for Best Traditional R&B Performance in 2017 for the single "Redbone." In 2018, his politically charged song "This Is America" debuted at number one atop the Billboard Hot 100, buoyed by a viral music video that addressed gun violence and racial injustice.'
chaseDesc = 'England\'s Chase & Status are one of the most commercially successful acts associated with drum \'n\' bass and dubstep, with multi-platinum albums, numerous charting singles, and production work for major artists like Snoop Dogg and Rihanna. Consisting of dance DJs and record-label owners Saul Milton and Will Kennard, with additional live performers, the group combine cutting-edge beats and production techniques with elements of rock, pop, reggae, hip-hop, and other styles, resulting in energetic tracks fit for the club as well as the radio.'
burnhamDesc = 'Robert Pickering "Bo" Burnham is an American comedian, musician, actor, filmmaker and poet. He began his performance career as a YouTuber in March 2006, and his videos have been viewed over 250 million times as of December 2018. Burnham signed a four-year record deal with Comedy Central Records and released his debut EP, Bo fo Sho, in 2008. His first full-length album, Bo Burnham, was released the following year. In 2010, Burnham\'s second album was released, and Words Words Words, his first live comedy special, aired on Comedy Central. His third album and second comedy special, what., was released in 2013 on his YouTube channel and Netflix. Burnham finished first overall in voting in 2011\'s Comedy Central Stand-up Showdown. His third stand-up comedy special, Make Happy, was released exclusively on Netflix on June 3, 2016.'
brockhamptonDesc = 'Brockhampton (stylized as BROCKHAMPTON) is an American musical collective formed in San Marcos, Texas, in 2015 and currently based in California. Led by Kevin Abstract, Brockhampton formed partially through the online forum "KanyeToThe", and define themselves as a boy band. In specifically labeling themselves in this way, as the members have repeatedly emphasized in interviews and on social media, they aim to reclaim or redefine the word, as their style does not fit neatly into the "boy band stereotype".'

gambinoEvent = { 'name': 'Childish Gambino', 'description': gambinoDesc, 'totalSupply': 20000, 'faceValue': 80, 'date': '2019-11-23T22:00:00' }
chaseEvent = { 'name': 'Chase & Status', 'description': chaseDesc, 'totalSupply': 800, 'faceValue': 30, 'date': '2019-06-14T20:15:00' }
burnhamEvent = { 'name': 'Bo Burnham', 'description': burnhamDesc, 'totalSupply': 650, 'faceValue': 46.99, 'date': '2020-03-02T18:45:00' }
brockhamptonEvent = { 'name': 'BROCKHAMPTON', 'description': brockhamptonDesc, 'totalSupply': 3700, 'faceValue': 65.50, 'date': '2019-07-28T21:08:00' }

# Create events if there is less than 100 in the system
eventNum = json.loads(requests.get(url = URL + '/events/').text)['numberOfEvents']
if (eventNum < 100):

    # Create some events of actual artists
    print('\nCreating actual artist events...')
    r = requests.post(url = URL + '/events/', data = gambinoEvent, headers = { 'Authorization': 'href ' + jwtTokens[0] })
    print(r.text)
    r = requests.post(url = URL + '/events/', data = chaseEvent, headers = { 'Authorization': 'href ' + jwtTokens[0] })
    print(r.text)
    r = requests.post(url = URL + '/events/', data = burnhamEvent, headers = { 'Authorization': 'href ' + jwtTokens[0] })
    print(r.text)
    r = requests.post(url = URL + '/events/', data = brockhamptonEvent, headers = { 'Authorization': 'href ' + jwtTokens[0] })
    print(r.text)

    print('\nCreating dummy artist events...')
    for n in range(100):
        print('Creating event', n + 1, 'of 100...')
        name = 'Dummy Event #' + str(n + 1)
        autToken = 'href ' + random.choice(jwtTokens)

        header = {
            'Authorization': autToken
        }
        event = {
            'name': name,
            'description': fillerDesc,
            'totalSupply': random.randint(100, 10000),
            'faceValue': random.randint(10, 150),
            'date': '2019-07-28T16:30:00'
        }

        r = requests.post(url = URL + '/events/', data = event, headers = header)
        print(r.text, '\n')


# STORING ALL EVENT IDs in an array
print('\nStoring all events...')
allEvents = []
eventsResponse = json.loads(requests.get(url = URL + '/events/').text)['events']
for event in eventsResponse:
    allEvents.append(event['_id'])


# BUYING TICKETS AND CREATING SELL LISTINGS
# Creating a user to buy tickets and make listings
print('\nCreating a consumer user to buy and sell tickets...')
consumer = {'email': 'consumer1@test.com', 
        'password': 'consumer1' }
r = requests.post(url = URL + '/auth/signup', data = consumer)
print(r.text)
r = requests.post(url = URL + '/auth/login', data = consumer)
consumerJwtToken = 'href ' + json.loads(r.text)['token']

# Buying random tickets
ticketsResponse = json.loads(requests.get(url = URL + '/tickets', headers = { 'Authorization': consumerJwtToken }).text)['tickets']
print('\nConsumer owns tickets to', len(ticketsResponse), 'different events')
if len(ticketsResponse) < 10:
    print('Buying tickets...')
    for n in range(25):
        print('Buying tickets for event', n + 1, 'of 25')
        event = {
            'eventID': random.choice(allEvents),
            'quantity': random.randint(1, 50)
        }
        r = requests.post(url = URL + '/tickets/buy', data = event, headers = { 'Authorization': consumerJwtToken } )
        print(r.text)


# STORING ALL EVENT IDs in an array
print('\nStoring event tickets owned by consumer...')
ticketsResponse = json.loads(requests.get(url = URL + '/tickets', headers = { 'Authorization': consumerJwtToken }).text)['tickets']
allTickets = []
for event in ticketsResponse:
    allTickets.append([event['eventID'], event['quantityOwned']])


# CREATING EVENT LISTINGS
listingsResponse = json.loads(requests.get(url = URL + '/tickets/sellListings').text)
if listingsResponse['numberOfListings'] < 20: 
    print('\nCreating event sell listings for the consumer...')
    for n in range(50):
        print('Creating sell listing', n + 1, 'of 50')
        eventListing = random.choice(allTickets)
        if int(eventListing[1]) < 1:
            continue
        ticketQuantity = random.randint(1, int(eventListing[1]))
        listing = {
            'eventID': eventListing[0],
            'sellPrice': random.randint(10, 100),
            'quantity': ticketQuantity
        }
        eventIndex = allTickets.index(eventListing)
        allTickets[eventIndex][1] = str(int(eventListing[1]) - ticketQuantity)
        r = requests.post(url = URL + '/tickets/sellListings', data = listing, headers = { 'Authorization': consumerJwtToken } )
        print(r.text)

print('\nSystem has been populated successfully!')