import React from 'react'

const Filters = ({children}:{children:any}) => {
  return (
    <div className='flex justify-between items-center bg-white px-[24px] py-[12px] m-[12px] rounded-[9px]'>
        {children}
    </div>
  )
}

export default Filters