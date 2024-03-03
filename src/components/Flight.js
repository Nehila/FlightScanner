import React, { useEffect, useState } from 'react'

const Flight = ({ id, price, logo, arrival, departure, duration, carrier,book_url, from, to }) => {


    const [formattedDateDeparture, setFormattedDateDeparture] = useState({});
    const [formattedDateArrival, setFormattedDateArrival] = useState({});
    const [Duration, setDuration] = useState('');
    
    const formatDuration = () => {
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        if (hours > 0){
            setDuration(`${hours}h ${minutes}m`)
        }else if (minutes == 0){
            setDuration(`${hours}h`)
        }else{
            setDuration(`${minutes}m`)
        }
    };

    const format_dates = (date, setData) => {
        const inputDate = new Date(date);
        const options = { day: 'numeric', month: 'long' };
        const formattedDayMonth = new Intl.DateTimeFormat('fr-FR', options).format(inputDate);
        const formattedTime = inputDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        setData({
            'time': formattedTime,
            'date': formattedDayMonth
        })
    }

    useEffect(() => {
        format_dates(arrival, setFormattedDateArrival)
        format_dates(departure, setFormattedDateDeparture)
        formatDuration()
    }, []);

  return (
    <div className='flight' key={id}>
        <div className='book-section'>
                <div className='logo-container'>
                    <img src={`https://www.skyscanner.net/images/airlines/small/${logo}.png`} className='jet-logo'/>
                </div>
                <button className='book-bbtn' onClick={() => window.location = `https://www.skyscanner.fr${book_url}`}>Book now<br></br>{price} MAD</button>          
                <span className='garenie'>2 days money back</span>          
            </div>
            <div className='flight-section'>
                <div className='time'>
                    <span className='date-day-month'>{formattedDateDeparture?.date}</span>
                    <span className='date-time'>{formattedDateDeparture?.time}</span>
                    <span className='destination'>{from}</span>
                </div>        
                <span className='time-between'>{Duration}</span> 
                <div className='time'>
                    <span className='date-day-month'>{formattedDateArrival?.date}</span>
                    <span className='date-time'>{formattedDateArrival?.time}</span>
                    <span className='destination'>{to}</span>
                </div>        
            </div>
    </div>
  )
}

export default Flight
