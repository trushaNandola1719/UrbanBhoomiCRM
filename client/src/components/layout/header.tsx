import React from 'react'

const Header = ({title, children}: {title: string, children: any}) => {
  return (
    <div className='header-container flex justify-between items-center bg-white h-[76px] shadow-xxs'>
        <div className="header-left p-[24px]">
            <h1 className="header-title text-2xl font-[550]">
                {title}
            </h1>
        </div>
        <div className="header-right px-[24px]">
            {children}
        </div>
    </div>
  )
}

export default Header