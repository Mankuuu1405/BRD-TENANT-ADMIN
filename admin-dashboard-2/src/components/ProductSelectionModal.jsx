import React from 'react';
import { 
  XMarkIcon, 
  BanknotesIcon, 
  BriefcaseIcon, 
  HomeIcon, 
  AcademicCapIcon 
} from '@heroicons/react/24/outline';

export default function ProductSelectionModal({ onClose, onSelect }) {
  const products = [
    {
      id: 'PERSONAL_LOAN',
      title: 'Personal Loan',
      icon: BanknotesIcon,
      desc: 'Unsecured loan for personal use. Up to ₹20 Lakhs with instant approval.',
      active: true,
      style: 'bg-white border-blue-200 hover:border-primary-500 hover:shadow-md hover:ring-1 hover:ring-primary-500 cursor-pointer'
    },
    {
      id: 'BUSINESS_LOAN',
      title: 'Business Loan',
      icon: BriefcaseIcon,
      desc: 'Working capital and expansion loans for registered SMEs and Startups.',
      active: false,
      style: 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
    },
    {
      id: 'HOME_LOAN',
      title: 'Home Loan',
      icon: HomeIcon,
      desc: 'Purchase or construction of residential property. Long tenure options.',
      active: false,
      style: 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
    },
     {
      id: 'EDUCATION_LOAN',
      title: 'Education Loan',
      icon: AcademicCapIcon,
      desc: 'Financial support for higher studies in India or universities abroad.',
      active: false,
      style: 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-scale-in transform transition-all">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Select Loan Product</h2>
            <p className="text-sm text-gray-500 mt-1">Choose the type of application you want to create.</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Product Grid */}
        <div className="p-8 bg-gray-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => product.active && onSelect(product.id)}
                disabled={!product.active}
                className={`flex items-start gap-4 p-5 rounded-xl border-2 text-left group transition-all duration-200 relative overflow-hidden ${product.style}`}
              >
                <div className={`p-3 rounded-lg shrink-0 transition-colors ${
                  product.active ? 'bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  <product.icon className="h-6 w-6" />
                </div>
                
                <div className="flex-1">
                  <h3 className={`font-bold text-base mb-1 ${product.active ? 'text-gray-900' : 'text-gray-500'}`}>
                    {product.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {product.desc}
                  </p>
                  
                  {!product.active && (
                    <span className="inline-block mt-3 text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-500 px-2 py-0.5 rounded">
                      Coming Soon
                    </span>
                  )}
                  
                  {product.active && (
                    <div className="mt-3 flex items-center text-xs font-bold text-primary-600 group-hover:translate-x-1 transition-transform">
                      Create Application &rarr;
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
            <button 
              onClick={onClose} 
              className="text-sm text-gray-500 hover:text-gray-800 font-medium px-4 py-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"
            >
              Cancel Selection
            </button>
        </div>
      </div>
    </div>
  );
}