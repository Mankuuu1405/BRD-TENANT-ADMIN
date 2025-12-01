import { useEffect, useMemo, useState } from 'react'

export default function Categories() {
  const defaults = useMemo(() => ({
    loan_category: ['Personal Loan','Home Loan','Business Loan','Gold Loan'],
    product_category: ['Secured','Unsecured','SME','Retail'],
    document_category: ['KYC','Income Proof','Address Proof','Business Documents'],
    lead_category: ['Hot Lead','Warm Lead','Cold Lead'],
    source_category: ['Website','Walk-in','Referral','Call Center'],
    customer_category: ['New Customer','Existing Customer','High Value Customer'],
    internal_team_category: ['Sales','Verification','Risk','Legal','Credit','Collection'],
    external_team_category: ['Valuation Agency','Recovery Agency','Legal Agency']
  }), [])

  const [config, setConfig] = useState(() => {
    try { const s = localStorage.getItem('categories_config'); if (s) return JSON.parse(s) } catch {}
    return defaults
  })
  useEffect(() => { try { localStorage.setItem('categories_config', JSON.stringify(config)) } catch {} }, [config])

  const [open, setOpen] = useState(null)
  const cards = useMemo(() => ([
    { key: 'loan_category', title: 'Loan Category', desc: 'Types of loans' },
    { key: 'product_category', title: 'Product Category', desc: 'Loan products' },
    { key: 'document_category', title: 'Document Category', desc: 'Document types' },
    { key: 'lead_category', title: 'Lead Category', desc: 'Types of leads' },
    { key: 'source_category', title: 'Source Category', desc: 'Where lead came from' },
    { key: 'customer_category', title: 'Customer Category', desc: 'Customer type' },
    { key: 'internal_team_category', title: 'Internal Team Category', desc: 'Internal role groups' },
    { key: 'external_team_category', title: 'External Team Category', desc: 'External agency groups' }
  ]), [])

  const Card = ({ title, desc, onOpen }) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-card p-4 flex items-center justify-between">
      <div className="flex flex-col">
        <div className="text-base font-semibold">{title}</div>
        <div className="text-xs text-gray-600 mt-1">{desc}</div>
      </div>
      <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={onOpen}>Manage</button>
    </div>
  )

  const Modal = ({ k }) => (
    <div className="fixed inset-0 bg-black/25 grid place-items-center z-40" onClick={()=>setOpen(null)}>
      <div className="bg-white w-full max-w-lg rounded-xl border border-gray-200 shadow-card p-4" onClick={(e)=>e.stopPropagation()}>
        {(() => { const t = cards.find(c=>c.key===k)?.title; return (
          <div className="text-lg font-semibold">{t}</div>
        ) })()}
        <div className="mt-3 grid grid-cols-2 gap-4">
          {(config[k]||[]).map((item, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_auto] items-center gap-3 w-full">
              <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-800 border border-gray-200 w-full">{item}</span>
              <button
                className="h-8 px-4 rounded-full border border-blue-200 bg-blue-600 text-white shadow-sm hover:bg-blue-700 justify-self-end min-w-[90px]"
                onClick={()=>{
                  const list = (config[k]||[]).filter((_,i)=>i!==idx)
                  setConfig({ ...config, [k]: list })
                }}
              >Remove</button>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2">
          {(() => { const t = cards.find(c=>c.key===k)?.title; return (
            <>
              <label className="text-sm font-medium text-gray-700">Add {t} item</label>
              <input placeholder={`Add ${t} item`} className="h-9 rounded-lg border border-gray-300 px-3" onKeyDown={(e)=>{ if (e.key==='Enter' && e.currentTarget.value.trim()) { const val = e.currentTarget.value.trim(); setConfig({ ...config, [k]: [ ...(config[k]||[]), val ] }); e.currentTarget.value=''; } }} />
              <div className="text-xs text-gray-500">Press Enter to add</div>
            </>
          ) })()}
        </div>
        <div className="mt-4 flex justify-center">
          <button className="h-9 px-4 rounded-lg border border-gray-200" onClick={()=>setOpen(null)}>Close</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="text-xl font-semibold">Type of category</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {cards.map(c => (
          <Card key={c.key} title={c.title} desc={c.desc} onOpen={()=>setOpen(c.key)} />
        ))}
      </div>

      {open && <Modal k={open} />}
    </div>
  )
}
