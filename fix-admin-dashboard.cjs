const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client/src/pages/AdminDashboard.tsx');
const content = fs.readFileSync(filePath, 'utf8');

const targetStr = "function CuponsTab() {";
const index = content.indexOf(targetStr);

if (index === -1) {
  console.log("Could not find CuponsTab");
  process.exit(1);
}

const beforeCuponsTab = content.substring(0, index);

const newCuponsTab = `function CuponsTab() {
  const { data: coupons, refetch } = trpc.coupons.getAll.useQuery();
  const createCoupon = trpc.coupons.create.useMutation();
  const deleteCoupon = trpc.coupons.delete.useMutation();
  const [formData, setFormData] = useState({ code: '', type: 'percentage', discountValue: 0, minOrderAmount: 0 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || formData.discountValue <= 0) return toast.error('Preencha código e desconto');
    await createCoupon.mutateAsync({ ...formData, type: formData.type as any, discountValue: Number(formData.discountValue), minOrderAmount: Number(formData.minOrderAmount) });
    toast.success('Cupom criado');
    setFormData({ code: '', type: 'percentage', discountValue: 0, minOrderAmount: 0 });
    refetch();
  };

  return (
    <div>
      <h2 className="text-xl font-display font-bold mb-6 text-[#F5F0E8]">Cupons de Desconto</h2>
      <form onSubmit={handleSubmit} className="mb-8 p-4 rounded-lg bg-[#111] border border-[#C9A227]/20 grid grid-cols-5 gap-4 items-end">
        <div>
          <label className="block text-sm text-[#8A7A5A] mb-1">Código</label>
          <input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="w-full bg-[#0A0A0A] border border-[#C9A227]/30 rounded p-2 text-white" />
        </div>
        <div>
          <label className="block text-sm text-[#8A7A5A] mb-1">Tipo</label>
          <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full bg-[#0A0A0A] border border-[#C9A227]/30 rounded p-2 text-white">
            <option value="percentage">Porcentagem (%)</option>
            <option value="fixed">Fixo (R$)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-[#8A7A5A] mb-1">Desconto</label>
          <input type="number" value={formData.discountValue} onChange={e => setFormData({ ...formData, discountValue: Number(e.target.value) })} className="w-full bg-[#0A0A0A] border border-[#C9A227]/30 rounded p-2 text-white" />
        </div>
        <div>
          <label className="block text-sm text-[#8A7A5A] mb-1">Pedido Mín. (R$)</label>
          <input type="number" value={formData.minOrderAmount} onChange={e => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })} className="w-full bg-[#0A0A0A] border border-[#C9A227]/30 rounded p-2 text-white" />
        </div>
        <button type="submit" className="bg-[#C9A227] text-black px-4 py-2 rounded font-bold">Criar</button>
      </form>
      <div className="grid gap-4">
        {coupons?.map(c => (
          <div key={c.id} className="p-4 rounded-lg bg-[#111] border border-[#C9A227]/20 flex justify-between items-center">
            <div>
              <p className="font-bold text-[#F5F0E8]">{c.code}</p>
              <p className="text-sm text-[#8A7A5A]">{c.discountType === 'percentage' ? c.discountValue + '%' : 'R$ ' + c.discountValue} • Min: R$ {c.minOrderAmount}</p>
            </div>
            <button onClick={async () => { await deleteCoupon.mutateAsync({ id: c.id }); refetch(); }} className="text-red-500 hover:text-red-400">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalculadoraTab() {
  const [address, setAddress] = useState('');
  const calculateDelivery = trpc.storeSettings.calculateDelivery.useMutation();

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return toast.error('Digite um endereço');
    
    try {
      await calculateDelivery.mutateAsync({ address });
    } catch (e) {
      toast.error('Erro ao calcular frete');
    }
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div>
      <h2 className="text-xl font-display font-bold mb-6 text-[#F5F0E8]">Calculadora de Frete</h2>
      <p className="text-sm text-[#8A7A5A] mb-6">
        Simule o valor da entrega para um determinado endereço com base nas suas configurações atuais de raio e quilometragem.
      </p>

      <div className="p-6 rounded-xl bg-[#111] border border-[#C9A227]/20 max-w-2xl">
        <form onSubmit={handleCalculate} className="flex gap-4 items-end mb-6">
          <div className="flex-1">
            <label className="block text-sm text-[#8A7A5A] mb-2">Endereço Completo (Rua, Número, Bairro, Cidade)</label>
            <input 
              type="text" 
              value={address} 
              onChange={e => setAddress(e.target.value)} 
              placeholder="Ex: Rua XV de Novembro, 1000, Centro, Curitiba"
              className="w-full bg-[#0A0A0A] border border-[#C9A227]/30 rounded p-3 text-white focus:outline-none focus:border-[#C9A227]" 
            />
          </div>
          <button 
            type="submit" 
            disabled={calculateDelivery.isPending}
            className="bg-[#C9A227] text-black px-6 py-3 rounded font-bold disabled:opacity-50 transition-all hover:brightness-110"
          >
            {calculateDelivery.isPending ? 'Calculando...' : 'Calcular'}
          </button>
        </form>

        {calculateDelivery.data && (
          <div className="mt-8 p-6 rounded-lg bg-[#0A0A0A] border border-[#C9A227]/10">
            <h3 className="text-lg font-bold text-[#F5F0E8] mb-4">Resultado:</h3>
            
            {!calculateDelivery.data.deliverable ? (
              <div className="text-red-400 p-4 bg-red-950/20 rounded-md border border-red-900/30">
                <p className="font-bold mb-1">Fora da área de entrega</p>
                <p className="text-sm">{calculateDelivery.data.message}</p>
                {calculateDelivery.data.distance !== undefined && (
                  <p className="text-xs mt-2 opacity-80">Distância calculada: {calculateDelivery.data.distance.toFixed(1)} km</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border-b border-white/5">
                  <span className="text-[#8A7A5A]">Distância:</span>
                  <span className="text-white font-medium">{calculateDelivery.data.distance?.toFixed(1)} km</span>
                </div>
                <div className="flex justify-between items-center p-3 border-b border-white/5">
                  <span className="text-[#8A7A5A]">Valor do Frete:</span>
                  <span className="text-[#C9A227] font-bold text-lg">
                    {calculateDelivery.data.fee === 0 ? 'Grátis' : formatMoney(calculateDelivery.data.fee)}
                  </span>
                </div>
                {calculateDelivery.data.warning && (
                  <p className="text-xs text-yellow-500 mt-2">{calculateDelivery.data.warning}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
`;

fs.writeFileSync(filePath, beforeCuponsTab + newCuponsTab);
console.log("Fixed AdminDashboard.tsx successfully.");
