const fs = require('fs');

const path = "C:\\Users\\trevotech\\Downloads\\newsburguer-source\\newsburguer\\client\\src\\pages\\AdminDashboard.tsx";
let content = fs.readFileSync(path, 'utf-8');

// 1. Add import
if (!content.includes('import GlobalOrderAlarm')) {
    content = content.replace(
        "import EditMenuItemModal from '@/components/EditMenuItemModal';",
        "import EditMenuItemModal from '@/components/EditMenuItemModal';\nimport GlobalOrderAlarm from '@/components/GlobalOrderAlarm';"
    );
}

// 2. Add GlobalOrderAlarm to Header
content = content.replace(
    /<div className="flex items-center gap-6">\s*<StoreToggle \/>/g,
    '<div className="flex items-center gap-6">\n              <GlobalOrderAlarm />\n              <StoreToggle />'
);

// 3. Remove alarm logic from PedidosTab
const pedidosTabStart = `function PedidosTab() {
  const { data: orders, isLoading, refetch } = trpc.orders.getAll.useQuery(undefined, { refetchInterval: 5000 });
  const { data: drivers } = trpc.drivers.getAll.useQuery();
  const updateStatus = trpc.orders.updateStatus.useMutation();
  const assignDriver = trpc.orders.assignDriver.useMutation();`;

const newPedidosTabStart = `function PedidosTab() {
  const { data: orders, isLoading, refetch } = trpc.orders.getAll.useQuery(undefined, { refetchInterval: 5000 });
  const { data: drivers } = trpc.drivers.getAll.useQuery();
  const updateStatus = trpc.orders.updateStatus.useMutation();
  const assignDriver = trpc.orders.assignDriver.useMutation();`;

// Everything from `const prevOrdersCount` up to just before `const handleStatusChange` can be removed.
const regexAlarmLogic = /const prevOrdersCount = useRef\(0\);[\s\S]*?const handleStatusChange = async/;
content = content.replace(regexAlarmLogic, 'const handleStatusChange = async');

// 4. Remove alarm buttons from PedidosTab return
const regexAlarmButtons = /<button[\s\S]*?onClick=\{\(\) => \{[\s\S]*?const nextState = !audioEnabled;[\s\S]*?<\/button>\s*\{\/\* Silenciar alarm button — shown while alarm is ringing \*\/\}\s*\{alarmActive && \([\s\S]*?<\/button>\s*\)\}/;
content = content.replace(regexAlarmButtons, '');

fs.writeFileSync(path, content, 'utf-8');
console.log('AdminDashboard.tsx updated successfully.');
