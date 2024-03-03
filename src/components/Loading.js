import React from 'react'
import { useGlobalState } from '..'

const Loading = () => {
    const [show, setShow] = useGlobalState('loading')
    return (
        <div className='wrapper' style={{display: show ? 'flex' : 'none'}}>
            <img src='assets/logo.png' className='logo-animated' />
        </div>
    )
}

export default Loading
