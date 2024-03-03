import axios from 'axios'
import React, { useEffect, useState } from 'react'
import AppServices from '../services/AppServices'
import Flight from '../components/Flight'
import { useGlobalState } from '..'

const Home = () => {
    const [searchPlaceFrom, setSearchPlaceFrom] = useState('')
    const [searchPlaceTo, setSearchPlaceTo] = useState('')
    const [flights, setFlights] = useState([])
    const [loading, setLoading] = useGlobalState('loading')

    const getDateToday = () => {
        const currentDate = new Date();

        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const day = currentDate.getDate().toString().padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        return formattedDate
    }   


    const get_flights_dict = async (flight_leg) => {
        if (flight_leg){

            const keys = {
                "PlaceId": 'airportId',
                "GeoId":"entityId",
                'PlaceName': "name",
                "CityId": "cityId",
                "CityName": "cityName",
                "GeoContainerId": "geoContainerId",
                "CountryId": "countryId",
            }
    
            const default_json = {
                "type": "Airport",
                "rawLocationId": "cmn"
            }
    
            let results = {}
            
    
            Object.keys(flight_leg).map((value) => {
                let key = keys[value]
                if (key){
                    results = {
                        ...results,
                        [key]: flight_leg[value]
                    }
                }
            })

            results.id = results.airportId
            results.centroidCoordinates = flight_leg.Location.split(',').map(parseFloat).slice().sort((a, b) => a - b);
            results.rawLocationId = results.airportId.toLowerCase()
            return {
                ...results,
                ...default_json
            }
        }else{
            return {}
        }

    }

    const find_carrier = async (data, carrier) => {
        for (var i = 0; i < data.length; i += 1){
            if (data[i].id.toString() == carrier.toString()){
                return data[i].alt_id
            }
        }
    }

    const find_legs = async (data, id) => {
        for (var i = 0; i < data.length; i += 1){
            if (data[i].id == id){
                return {
                    arrival: data[i].arrival,
                    departure: data[i].departure,
                    duration: data[i].duration,
                    carrier: data[i].marketing_carrier_ids[data[i].marketing_carrier_ids.length - 1]
                }
            }
        }
    }

    const clean_data = async (data) => {
        let flights = []
        for (var i = 0; i < data.itineraries.length; i += 1){
            var value = data.itineraries[i]
            var legs_flight = await find_legs(data.legs, value.id)
            var logo = await find_carrier(data.carriers, legs_flight.carrier)
            flights.push({
                id: value.id,
                price: value.cheapest_price.amount,
                book_url: value.pricing_options[0].items[0].url,
                logo,
                ...legs_flight
            })
        }
        console.log(flights)
        setFlights(flights.sort((a, b) => a.price - b.price))
    }


    const build_request_payload = async (hook="/skyscanner") => {
        const from_data = await get_flights_dict(data.from)
        const to_data = await get_flights_dict(data.to)

        let payload = {
            "market":"MA",
            "locale":"en-GB",
            "currency":"MAD",
            "alternativeOrigins":false,
            "alternativeDestinations":false,
            "destination": from_data,
            "adults":data.passengers,
            "cabin_class":"economy",
            "child_ages":[
               
            ],
            "options":{
               "include_unpriced_itineraries":true,
               "include_mixed_booking_options":true
            },
            "origin": to_data,
            "outboundDate": data.date,
            "prefer_directs":true,
            "state":{
               
            },
            "viewId":"bd038939-41b7-40b2-97af-203df4656dba",
            "travellerContextId":"cb1cbce5-3a1a-40c0-ae97-651cf7df1311",
            "trusted_funnel_search_guid":"bd038939-41b7-40b2-97af-203df4656dba",
            "legs":[
               {
                  
                  "origin":from_data.id,
                  "originEntityId":from_data.entityId,
                  "destination":to_data.id,
                  "destinationEntityId":to_data.entityId,
                  "date":data.date,
                  "add_alternative_origins":false,
                  "add_alternative_destinations":false
               }
            ]
        }

        return AppServices.post(payload, hook).then(async (response) => {
            console.log(response)
            await clean_data(response)
            return {session_id: response.context.session_id, count: response.itineraries.length}
        })

    }



    const onSearch = async () => {
        if (searchPlaceFrom !== '' && searchPlaceTo !== '') {
            setLoading(true)
            const {session_id, count} = await build_request_payload();
            let executionCount = 0;
        
            const makeRequest = async () => {
                try {
                await build_request_payload(`/session/${session_id}`);
                executionCount++;
                if (executionCount < 3) {
                    setTimeout(makeRequest, 3000);
                }else{
                    setLoading(false)
                }
                } catch (error) {
                    console.error('Error:', error);
                }
            };

            if (count < 2){
                await makeRequest();
            }else{
                setLoading(false)
            }

            
        }
      };
    const [data, setData] = useState({
        'from': null,
        'to': null,
        'passengers': '1',
        'date': getDateToday()
    })


    const [showFrom, setShowFrom] = useState(false)
    const [showTo, setShowTo] = useState(false)
    const handleSearchChange = (e, setSearchPlace) => {
        setSearchPlace(e.target.value)
    }

    const fetchData = async (keyword) => {
        try {
          const response = await axios.get(
            `https://www.skyscanner.fr/g/autosuggest-search/api/v1/search-flight/MA/en-GB/${keyword}?isDestination=false&enable_general_search_v2=true&autosuggestExp=`
          );
          
          return response.data
        } catch (error) {}
      };

    const handleInputChange = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value
        })
    }

    const [suggestionsTo, setSuggestionsTo] = useState([])
    const [suggestionsFrom, setSuggestionsFrom] = useState([])


    useEffect(() => {
        const fetch = async () => {
            setSuggestionsTo(await fetchData(searchPlaceTo))
        }
        fetch()
    }, [searchPlaceTo])

    useEffect(() => {
        const fetch = async () => {
            setSuggestionsFrom(await fetchData(searchPlaceFrom))
        }
        fetch()
    }, [searchPlaceFrom])

    


    const toogleShowFrom = (value) => {
        setShowFrom(value)
    }
    const toogleShowTo = (value) => {
        setShowTo(value)
    }

    useEffect(() => {
        const a = async () => {
            console.log(await get_flights_dict(data.to))
        }
        a()
    }, [data])
    
    
    const handleCityChoice = (suggestions, setDataUI, placeID, key) => {
        suggestions.map((value) => {
            if (value.PlaceId == placeID){
                setDataUI(`${value.PlaceName} - ${value.PlaceId}`)
                setData({
                    ...data,
                    [key]: value
                })
                return 1
            }
        })
    }


    return (
    <>
        <div className='hero-wrapper'>
            <section className='hero'>
                <img src='assets/logo.png' className='logo'/>
                <div className='hero-display'>
                    <span className='text-hero'><b>Fly But </b> <span className='thin-text'>This <br></br>Time Cheaper </span></span>
                    <img src='assets/plane.png' className='plane'/>
                </div>
                <div className='inputs'>
                    <div className='input-wrapper' onFocus={() => toogleShowFrom(true)}>
                        <span className='label-input'>From</span>
                        <input placeholder='Starting Airport' className='select-input' value={searchPlaceFrom} onChange={(e) => handleSearchChange(e, setSearchPlaceFrom)}/>
                        <div className='choices' style={{display: showFrom ? 'block' : 'none'}}>
                            {suggestionsFrom.map((suggestion) => (
                                <div className='choice' onClick={() => {
                                    handleCityChoice(suggestionsFrom, setSearchPlaceFrom, suggestion.PlaceId, 'from')
                                    toogleShowFrom(false)
                                }} key={suggestion.PlaceId} >{suggestion.PlaceName} - {suggestion.PlaceId}</div>
                            ))}
                        </div>
                    
                    </div>
                    <div className='input-wrapper' onFocus={() => toogleShowTo(true)}>
                        <span className='label-input'>To</span>
                        <input placeholder='Starting Airport' className='select-input' value={searchPlaceTo} onChange={(e) => handleSearchChange(e, setSearchPlaceTo)}/>
                        <div className='choices' style={{display: showTo ? 'block' : 'none'}}>
                            
                            {suggestionsTo.map((suggestion) => (
                                <div className='choice' onClick={() => {
                                    handleCityChoice(suggestionsTo, setSearchPlaceTo, suggestion.PlaceId, 'to')
                                    toogleShowTo(false)
                                }} key={suggestion.PlaceId} >{suggestion.PlaceName} - {suggestion.PlaceId}</div>
                            ))}
                        </div>
                    
                    </div>
                    <div className='input-wrapper'>
                        <span className='label-input'>Date</span>
                        <input placeholder='Date of departure' type='date' name='date' onChange={handleInputChange} defaultValue={data.date} className='select-input'/>
                        </div>
                    <div className='input-wrapper'>
                        <span className='label-input'>Number of passengers</span>
                        <input placeholder='Adult passengers' type='number' name='passengers' onChange={handleInputChange} defaultValue={data.passengers} className='select-input'/>
                    </div>
                    <img src='assets/search.png' className='search' onClick={onSearch}/>
                </div>
            </section>
            <div className='line-animations'>
                <img src='assets/line.png' className='line'/>
                <div className='mini-planes'>
                    <img src='assets/mini-plane.png' className='mini-plane'/>
                    <img src='assets/mini-plane.png' className='mini-plane'/>
                    <img src='assets/mini-plane.png' className='mini-plane'/>
                    <img src='assets/mini-plane.png' className='mini-plane'/>
                    <img src='assets/mini-plane.png' className='mini-plane'/>
                </div>
            </div>
        </div>
        <div className='flights-wrapper'>
                <div className='flights'>
                    <span className='big-title'>Flights</span>
                    <div className='flights-container'>
                        {flights.map((value) => {
                            return <Flight {...value} from={searchPlaceFrom} to={searchPlaceTo}/>
                        })}
                        
                    </div>
                        
                </div>
        </div>
    </>
    )
}

export default Home
