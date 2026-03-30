import React, { useState, useEffect } from 'react';
import { loadImage } from '../utils/storage';
const SavingCard = () => {
    return (
        <div className='flex items-center justify-center h-full'>
            <div className='flex items-center justify-center gap-2'>
                <div className='w-4 h-4 bg-blue-500 rounded-full animate-bounce'></div>
                <p className='text-blue-500'>Saving card...</p>
                <button onClick={() => { }}>Cancel</button>
                <button onClick={() => { }}>Save</button>
                <button onClick={() => { }}>Don't Save</button>
            </div>
        </div>
    )
}

export default SavingCard