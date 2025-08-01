import React from 'react'

const Model = ({children,isOpen,onClose, title,}) => {
     
    if(!isOpen) return;
  
     return <div className="fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-[calc(100%-1rem)] max-h-full overflow-y-auto overflow-x-hidden bg-black/20 bg-opacity-50">
    <div className="relative p-4 w-full max-w-2xl max-h-full">
 
    <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">

    <div className="flex items-center justify-center p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
    <h3 className="text-lg font-medium text-gray-900 dark:text-white ">
    {title}
    </h3>
    <button
    type="button"
    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer absolute top-3 right-3"
    onClick={onClose}
    > 
    {/* <svg
    className="w-3 h-3"
    aria-hidden="true"
    xmlns="http://www.w3.org/2888/svg" 
    fill="none"
    viewBox="0 0 14 14">
    
    <path
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    //d="m1 1 6 6m0 0 6 6W7 716-6M7 71-6 6"
     d="M6 18L18 6M6 6l12 12"
/>
</svg> */}

  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
</button>
</div>

{/* Modal body */}
<div className="p-4 md:p-5 space-y-4">
    {children}
</div>
</div>
</div>
</div>
  
};

export default Model;
