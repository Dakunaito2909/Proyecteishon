// ============================================================================
// GELAB-AV · PROTOTIPO ACADÉMICO NAVEGABLE (IUE - CENTRO DE MEDIOS Y LABS)
// Cumple: RF-001..RF-020, RN-011..RN-016, RD-001..RD-003, RES-001..RES-002
// ============================================================================

const STORAGE_KEY = 'gelab_av_iue_v1';

// 1. DATOS SEMILLA FICTICIOS (RD-001, RD-002, RD-003, RES-002)
function getInitialState() {
  const now = new Date();
  const plus2h = new Date(now.getTime() + 2 * 3600 * 1000).toISOString().slice(0, 16);
  const plus6h = new Date(now.getTime() + 6 * 3600 * 1000).toISOString().slice(0, 16);
  const yesterdayStart = new Date(now.getTime() - 28 * 3600 * 1000).toISOString().slice(0, 16);
  const yesterdayEnd = new Date(now.getTime() - 4 * 3600 * 1000).toISOString().slice(0, 16);

  return {
    users: [
      { code: 'EST-101', pass: '1234', name: 'Camila Ríos', role: 'Estudiante', maxActiveLoans: 2 },
      { code: 'EST-102', pass: '1234', name: 'Mateo Gómez', role: 'Estudiante', maxActiveLoans: 2 },
      { code: 'DOC-201', pass: '1234', name: 'Prof. Carlos Restrepo', role: 'Docente', maxActiveLoans: 4 },
      { code: 'AUX-301', pass: '1234', name: 'Laura Vélez', role: 'Auxiliar Lab', maxActiveLoans: 5 },
      { code: 'SOP-401', pass: '1234', name: 'Andrés Mejía', role: 'Soporte Técnico', maxActiveLoans: 5 }
    ],
    assets: [
      {
        id: 'EQ-01',
        name: 'Kit Cámara Sony Alpha A7III',
        category: 'Cámara / Video',
        techStatus: 'Disponible', // RF-010: Disponible | Mantenimiento | Fuera de Servicio
        mandatoryAccessories: ['Trípode Manfrotto', 'Micrófono Shotgun Rode', 'Cable HDMI/Audio'],
        optionalAccessories: ['Luz LED Portátil', 'Memoria SD 128GB'],
        guide: 'Verificar seguro del trípode antes de montar el cuerpo de la cámara.'
      },
      {
        id: 'EQ-02',
        name: 'Kit Cámara Respaldo Sony A6400',
        category: 'Cámara / Video',
        techStatus: 'Disponible',
        mandatoryAccessories: ['Trípode Básico', 'Batería y Cargador', 'Cable USB-C'],
        optionalAccessories: ['Micrófono Solapa'],
        guide: 'Formatear tarjeta SD tras respaldar archivos académicos.'
      },
      {
        id: 'EQ-03',
        name: 'Consola Podcast + 2 Micrófonos Shure',
        category: 'Audio',
        techStatus: 'Disponible',
        mandatoryAccessories: ['2 Cables XLR', 'Adaptador de Corriente', 'Audífonos Monitoreo'],
        optionalAccessories: ['Brazo Articulado'],
        guide: 'No activar Phantom Power +48V si se conectan micrófonos dinámicos.'
      },
      {
        id: 'EQ-04',
        name: 'Portátil Edición Dell Precision 5570',
        category: 'Cómputo',
        techStatus: 'Mantenimiento',
        mandatoryAccessories: ['Cargador 130W', 'Maletín Protector'],
        optionalAccessories: ['Mouse Inalámbrico'],
        guide: 'Entrega con sesión de invitado habilitada.'
      },
      {
        id: 'EQ-05',
        name: 'Proyector Epson PowerLite Full HD',
        category: 'Proyección',
        techStatus: 'Disponible',
        mandatoryAccessories: ['Cable HDMI 5m', 'Cable Poder', 'Control Remoto'],
        optionalAccessories: ['Adaptador USB-C a HDMI'],
        guide: 'Esperar enfriamiento de lámpara antes de desconectar de la red.'
      }
    ],
    requests: [
      // Préstamo vencido para probar bloqueo RF-008 en EST-102
      {
        id: 'SOL-1001',
        userCode: 'EST-102',
        userName: 'Mateo Gómez',
        assetId: 'EQ-05',
        assetName: 'Proyector Epson PowerLite Full HD',
        purpose: 'Sustentación proyecto aula bloque 3',
        start: yesterdayStart,
        end: yesterdayEnd,
        status: 'Vencido', // RN-015
        urgent: false,
        selectedOptional: [],
        notes: 'Superó fecha límite de entrega (RN-012).'
      },
      // Solicitud pendiente para probar aprobación/rechazo del Auxiliar (RF-003)
      {
        id: 'SOL-1002',
        userCode: 'EST-101',
        userName: 'Camila Ríos',
        assetId: 'EQ-01',
        assetName: 'Kit Cámara Sony Alpha A7III',
        purpose: 'Entrevista documental Centro de Medios',
        start: plus2h,
        end: plus6h,
        status: 'Solicitado',
        urgent: true,
        selectedOptional: ['Luz LED Portátil'],
        notes: 'Solicitud urgente (<24h) registrada (RF-002).'
      }
    ],
    incidents: [],
    notifications: [
      {
        id: 1,
        time: new Date().toLocaleTimeString(),
        text: 'Sistema GELAB-AV iniciado en modo aislado académico (RES-001).'
      },
      {
        id: 2,
        time: new Date().toLocaleTimeString(),
        text: 'Alerta RN-012: Mateo Gómez (EST-102) presenta préstamo vencido SOL-1001. Aprobaciones bloqueadas (RF-008).'
      }
    ]
  };
}

let state = loadState();
let currentUser = null;

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : getInitialState();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateNotificationBadge();
}

function pushNotification(text) {
  state.notifications.unshift({
    id: Date.now(),
    time: new Date().toLocaleTimeString(),
    text
  });
  saveState();
}

// 2. AUTENTICACIÓN SIMULADA (RF-013)
document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const code = document.getElementById('login-code').value.trim().toUpperCase();
  const pass = document.getElementById('login-pass').value.trim();
  const user = state.users.find((u) => u.code === code && u.pass === pass);
  if (!user) {
    alert('Credenciales ficticias inválidas. Usa el acceso rápido o clave 1234.');
    return;
  }
  startSession(user);
});

window.quickLogin = function (code) {
  const user = state.users.find((u) => u.code === code);
  if (user) startSession(user);
};

function startSession(user) {
  currentUser = user;
  document.getElementById('login-view').classList.add('hidden');
  document.getElementById('app-view').classList.remove('hidden');
  document.getElementById('current-user-name').textContent = `${user.name} (${user.code})`;
  document.getElementById('current-user-role').textContent = user.role;

  // Inicializar fechas por defecto en filtros y formulario
  const now = new Date();
  const startDef = new Date(now.getTime() + 26 * 3600 * 1000).toISOString().slice(0, 16);
  const endDef = new Date(now.getTime() + 30 * 3600 * 1000).toISOString().slice(0, 16);
  document.getElementById('filter-start').value = startDef;
  document.getElementById('filter-end').value = endDef;
  document.getElementById('req-start').value = startDef;
  document.getElementById('req-end').value = endDef;

  renderAll();
}

document.getElementById('btn-logout').addEventListener('click', () => {
  currentUser = null;
  document.getElementById('app-view').classList.add('hidden');
  document.getElementById('login-view').classList.remove('hidden');
});

// NAVEGACIÓN POR PESTAÑAS
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// 3. REGLAS DE DISPONIBILIDAD Y SOLAPAMIENTO (RF-001 / RN-013 / RN-016)
function hasTimeOverlap(startA, endA, startB, endB) {
  return new Date(startA) < new Date(endB) && new Date(endA) > new Date(startB);
}

function isAssetAvailableForPeriod(asset, start, end, ignoreRequestId = null) {
  if (asset.techStatus !== 'Disponible') {
    return { available: false, reason: `Estado técnico: ${asset.techStatus}` };
  }
  const blockingStatuses = ['Solicitado', 'Aprobado', 'En Préstamo', 'Vencido'];
  const conflict = state.requests.find(
    (r) =>
      r.id !== ignoreRequestId &&
      r.assetId === asset.id &&
      blockingStatuses.includes(r.status) &&
      hasTimeOverlap(start, end, r.start, r.end)
  );
  if (conflict) {
    return {
      available: false,
      reason: `Cruce horario con ${conflict.id} (${conflict.status})`
    };
  }
  return { available: true, reason: 'Disponible en el periodo' };
}

function userHasOverdueLoans(userCode) {
  return state.requests.some((r) => r.userCode === userCode && r.status === 'Vencido');
}

function userActiveLoansCount(userCode) {
  const activeStatuses = ['Solicitado', 'Aprobado', 'En Préstamo', 'Vencido'];
  return state.requests.filter((r) => r.userCode === userCode && activeStatuses.includes(r.status)).length;
}

// 4. RENDERIZADO GENERAL
function renderAll() {
  if (!currentUser) return;
  renderUserBanner();
  renderCatalog();
  populateAssetSelect();
  renderRequestsList();
  renderTechAndIncidents();
  renderHistory();
  updateNotificationBadge();
}

function renderUserBanner() {
  const banner = document.getElementById('user-alert-banner');
  const hasOverdue = userHasOverdueLoans(currentUser.code);
  const activeCount = userActiveLoansCount(currentUser.code);

  if (hasOverdue) {
    banner.classList.remove('hidden');
    banner.textContent = `⛔ BLOQUEO ACTIVO (RF-008 / RN-012): Tienes al menos un préstamo VENCIDO. No se aprobarán nuevas solicitudes hasta regularizar la devolución.`;
  } else if (activeCount >= currentUser.maxActiveLoans) {
    banner.classList.remove('hidden');
    banner.textContent = `⚠️ LÍMITE ALCANZADO (RN-014): Has alcanzado el máximo de ${currentUser.maxActiveLoans} préstamos/solicitudes simultáneas permitidas para tu perfil (${currentUser.role}).`;
  } else {
    banner.classList.add('hidden');
  }
}

// CATÁLOGO (RF-001)
document.getElementById('btn-check-availability').addEventListener('click', renderCatalog);

function renderCatalog() {
  const grid = document.getElementById('catalog-grid');
  const start = document.getElementById('filter-start').value;
  const end = document.getElementById('filter-end').value;

  grid.innerHTML = state.assets
    .map((asset) => {
      const check =
        start && end
          ? isAssetAvailableForPeriod(asset, start, end)
          : { available: asset.techStatus === 'Disponible', reason: asset.techStatus };

      const badgeClass =
        asset.techStatus !== 'Disponible'
          ? 'badge-bad'
          : check.available
          ? 'badge-ok'
          : 'badge-warn';

      return `
        <div class="asset-card">
          <div>
            <div class="asset-header">
              <strong>${asset.name}</strong>
              <span class="badge ${badgeClass}">${check.reason}</span>
            </div>
            <small class="muted">Categoría: ${asset.category} · ID: ${asset.id}</small>
            <ul class="acc-list">
              <li><strong>Obligatorios (RN-016):</strong> ${asset.mandatoryAccessories.join(', ')}</li>
              <li><strong>Opcionales:</strong> ${asset.optionalAccessories.length ? asset.optionalAccessories.join(', ') : 'Ninguno'}</li>
              <li><strong>Instructivo:</strong> ${asset.guide}</li>
            </ul>
          </div>
          <button class="btn btn-primary btn-sm" ${!check.available ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}
            onclick="preselectAssetForRequest('${asset.id}')">
            ${check.available ? 'Solicitar este Equipo' : 'No Disponible'}
          </button>
        </div>
      `;
    })
    .join('');
}

window.preselectAssetForRequest = function (assetId) {
  document.querySelector('[data-tab="tab-requests"]').click();
  const select = document.getElementById('req-asset');
  select.value = assetId;
  renderOptionalAccessoriesSelector();
  document.getElementById('req-start').value = document.getElementById('filter-start').value;
  document.getElementById('req-end').value = document.getElementById('filter-end').value;
};

// 5. FORMULARIO DE SOLICITUD Y BORRADORES (RF-002 / RF-015 / RN-014)
function populateAssetSelect() {
  const select = document.getElementById('req-asset');
  const currentVal = select.value;
  select.innerHTML = state.assets
    .map((a) => `<option value="${a.id}">${a.name} (${a.techStatus})</option>`)
    .join('');
  if (currentVal) select.value = currentVal;
  renderOptionalAccessoriesSelector();
}

document.getElementById('req-asset').addEventListener('change', renderOptionalAccessoriesSelector);

function renderOptionalAccessoriesSelector() {
  const asset = state.assets.find((a) => a.id === document.getElementById('req-asset').value);
  const box = document.getElementById('req-accessories-box');
  if (!asset) return;

  box.innerHTML = `
    <p><strong>Accesorios obligatorios incluidos (RN-016):</strong> ${asset.mandatoryAccessories.join(', ')}</p>
    <p style="margin-top:0.4rem;"><strong>Selecciona accesorios opcionales adicionales:</strong></p>
    ${
      asset.optionalAccessories.length
        ? asset.optionalAccessories
            .map(
              (opt) => `
          <label style="display:inline-flex;align-items:center;gap:0.3rem;margin-right:1rem;font-weight:normal;">
            <input type="checkbox" name="opt-acc" value="${opt}" style="width:auto;" /> ${opt}
          </label>
        `
            )
            .join('')
        : '<span>Este kit no tiene accesorios opcionales.</span>'
    }
  `;
}

document.getElementById('btn-save-draft').addEventListener('click', () => handleRequestSubmit(true));
document.getElementById('loan-request-form').addEventListener('submit', (e) => {
  e.preventDefault();
  handleRequestSubmit(false);
});

function handleRequestSubmit(isDraft) {
  const editId = document.getElementById('edit-request-id').value;
  const assetId = document.getElementById('req-asset').value;
  const purpose = document.getElementById('req-purpose').value.trim();
  const start = document.getElementById('req-start').value;
  const end = document.getElementById('req-end').value;
  const asset = state.assets.find((a) => a.id === assetId);

  if (!purpose || !start || !end) {
    alert('Completa la actividad académica y el rango de fechas.');
    return;
  }
  if (new Date(start) >= new Date(end)) {
    alert('La fecha de devolución debe ser posterior a la fecha de inicio.');
    return;
  }

  const selectedOptional = Array.from(document.querySelectorAll('input[name="opt-acc"]:checked')).map(
    (cb) => cb.value
  );

  // Si no es borrador, validar disponibilidad (RN-013) y límite de préstamos (RN-014)
  if (!isDraft) {
    const avail = isAssetAvailableForPeriod(asset, start, end, editId || null);
    if (!avail.available) {
      alert(`No es posible enviar la solicitud: ${avail.reason} (RN-013).`);
      return;
    }
    const activeCount = userActiveLoansCount(currentUser.code);
    if (!editId && activeCount >= currentUser.maxActiveLoans) {
      alert(`Superaste el límite máximo de ${currentUser.maxActiveLoans} préstamos activos (RN-014).`);
      return;
    }
  }

  // Detectar urgencia (< 24 horas) según RF-002 / RF-004
  const hoursUntilStart = (new Date(start) - new Date()) / (1000 * 3600);
  const isUrgent = hoursUntilStart <= 24;

  if (editId) {
    const req = state.requests.find((r) => r.id === editId);
    Object.assign(req, {
      assetId: asset.id,
      assetName: asset.name,
      purpose,
      start,
      end,
      selectedOptional,
      urgent: isUrgent,
      status: isDraft ? 'Borrador' : 'Solicitado',
      notes: isDraft ? 'Borrador editado (RF-015).' : isUrgent ? 'Solicitud Urgente (<24h) enviada (RF-004).' : 'Solicitud ordinaria enviada (RF-002).'
    });
    pushNotification(`Solicitud ${req.id} actualizada a estado ${req.status}.`);
  } else {
    const newReq = {
      id: 'SOL-' + Math.floor(1000 + Math.random() * 9000),
      userCode: currentUser.code,
      userName: currentUser.name,
      assetId: asset.id,
      assetName: asset.name,
      purpose,
      start,
      end,
      selectedOptional,
      urgent: isUrgent,
      status: isDraft ? 'Borrador' : 'Solicitado',
      notes: isDraft ? 'Guardado en borrador (RF-015).' : isUrgent ? 'Solicitud Urgente (<24h) (RF-004).' : 'Solicitud ordinaria (RF-002).'
    };
    state.requests.unshift(newReq);
    pushNotification(`Nueva solicitud ${newReq.id} (${newReq.status}) creada por ${currentUser.name}.`);
  }

  resetRequestForm();
  saveState();
  renderAll();
}

window.editDraftRequest = function (reqId) {
  const req = state.requests.find((r) => r.id === reqId);
  if (!req) return;
  document.getElementById('edit-request-id').value = req.id;
  document.getElementById('req-form-title').textContent = `Editando Borrador ${req.id} (RF-015)`;
  document.getElementById('req-asset').value = req.assetId;
  renderOptionalAccessoriesSelector();
  document.getElementById('req-purpose').value = req.purpose;
  document.getElementById('req-start').value = req.start;
  document.getElementById('req-end').value = req.end;
  document.getElementById('btn-cancel-edit').classList.remove('hidden');
};

window.cancelRequest = function (reqId) {
  const idx = state.requests.findIndex((r) => r.id === reqId);
  if (idx === -1) return;
  const req = state.requests[idx];
  state.requests.splice(idx, 1);
  pushNotification(`Solicitud ${req.id} cancelada y eliminada antes de aprobación (RF-015).`);
  saveState();
  renderAll();
};

document.getElementById('btn-cancel-edit').addEventListener('click', resetRequestForm);

function resetRequestForm() {
  document.getElementById('edit-request-id').value = '';
  document.getElementById('req-form-title').textContent = 'Registrar Solicitud de Préstamo (RF-002 / RF-015)';
  document.getElementById('req-purpose').value = '';
  document.getElementById('btn-cancel-edit').classList.add('hidden');
}

// 6. FLUJO DE APROBACIÓN, ENTREGA, DEVOLUCIÓN Y NOVEDADES (RF-003..RF-008 / RF-016 / RF-019 / RF-020)
function getStatusBadge(status) {
  const map = {
    Borrador: 'badge-gray',
    Solicitado: 'badge-info',
    Aprobado: 'badge-ok',
    Rechazado: 'badge-bad',
    'En Préstamo': 'badge-info',
    Vencido: 'badge-bad',
    Devuelto: 'badge-ok',
    'Con Novedad': 'badge-warn',
    Cerrado: 'badge-gray'
  };
  return `<span class="badge ${map[status] || 'badge-gray'}">${status}</span>`;
}

function renderRequestsList() {
  const list = document.getElementById('active-requests-list');
  const isStaff = ['Auxiliar Lab', 'Soporte Técnico'].includes(currentUser.role);

  const visibleRequests = isStaff
    ? state.requests
    : state.requests.filter((r) => r.userCode === currentUser.code);

  if (!visibleRequests.length) {
    list.innerHTML = '<p class="help-text">No hay solicitudes registradas para mostrar.</p>';
    return;
  }

  list.innerHTML = visibleRequests
    .map((req) => {
      const hasOverdue = userHasOverdueLoans(req.userCode);
      let actionButtons = '';

      // Acciones del solicitante en Borrador o Solicitado (RF-015)
      if (req.status === 'Borrador' && req.userCode === currentUser.code) {
        actionButtons += `
          <button class="btn btn-secondary btn-sm" onclick="editDraftRequest('${req.id}')">Editar Borrador</button>
          <button class="btn btn-danger btn-sm" onclick="cancelRequest('${req.id}')">Cancelar</button>
        `;
      }
      if (req.status === 'Solicitado' && req.userCode === currentUser.code) {
        actionButtons += `<button class="btn btn-outline btn-sm" onclick="cancelRequest('${req.id}')">Cancelar Solicitud</button>`;
      }

      // Acciones administrativas del Auxiliar de Laboratorio
      if (isStaff) {
        if (req.status === 'Solicitado') {
          actionButtons += `
            <button class="btn btn-primary btn-sm" onclick="approveRequest('${req.id}')">
              ${req.urgent ? 'Aprobar Urgencia (RF-004)' : 'Aprobar (RF-003)'}
            </button>
            <button class="btn btn-danger btn-sm" onclick="rejectRequest('${req.id}')">Rechazar</button>
          `;
        }
        if (req.status === 'Aprobado') {
          actionButtons += `
            <button class="btn btn-secondary btn-sm" onclick="openChecklistModal('${req.id}', 'delivery')">
              Registrar Entrega (RF-005)
            </button>
            <button class="btn btn-warning btn-sm" onclick="markNotPickedUp('${req.id}')">
              No Recogido (RF-016)
            </button>
          `;
        }
        if (['En Préstamo', 'Vencido'].includes(req.status)) {
          actionButtons += `
            <button class="btn btn-primary btn-sm" onclick="openChecklistModal('${req.id}', 'return')">
              Registrar Devolución / Novedad (RF-005/020)
            </button>
          `;
        }
        if (req.status === 'Devuelto') {
          actionButtons += `
            <button class="btn btn-light btn-sm" onclick="closeLoan('${req.id}')">Cerrar Acta (RN-015)</button>
          `;
        }
      }

      return `
        <div class="request-item">
          <div class="request-top">
            <div>
              <strong>${req.id} · ${req.assetName}</strong>
              ${req.urgent ? '<span class="badge badge-warn">URGENTE &lt;24h</span>' : ''}
              ${hasOverdue && req.status === 'Solicitado' ? '<span class="badge badge-bad">USUARIO BLOQUEADO POR MORA (RF-008)</span>' : ''}
            </div>
            ${getStatusBadge(req.status)}
          </div>
          <div class="request-meta">
            <strong>Solicitante:</strong> ${req.userName} (${req.userCode}) |
            <strong>Periodo:</strong> ${req.start.replace('T', ' ')} → ${req.end.replace('T', ' ')}<br/>
            <strong>Actividad:</strong> ${req.purpose} |
            <strong>Opcionales:</strong> ${req.selectedOptional.length ? req.selectedOptional.join(', ') : 'Ninguno'}<br/>
            <strong>Bitácora:</strong> ${req.notes}
          </div>
          <div class="form-actions">${actionButtons}</div>
        </div>
      `;
    })
    .join('');
}

window.approveRequest = function (reqId) {
  // RF-019: Control de concurrencia simulado
  if (document.getElementById('simulate-concurrency-lock').checked) {
    alert('Bloqueo de concurrencia (RF-019): Otro auxiliar está gestionando esta solicitud en este instante.');
    return;
  }

  const req = state.requests.find((r) => r.id === reqId);
  if (!req) return;

  // RF-008: Bloqueo por préstamos vencidos
  if (userHasOverdueLoans(req.userCode)) {
    alert(`BLOQUEO RF-008: El usuario ${req.userName} tiene préstamos vencidos. No se puede aprobar.`);
    return;
  }

  // Verificar nuevamente que el equipo no tenga cruce horario ni falla técnica
  const asset = state.assets.find((a) => a.id === req.assetId);
  const avail = isAssetAvailableForPeriod(asset, req.start, req.end, req.id);
  if (!avail.available) {
    alert(`No se puede aprobar: ${avail.reason}.`);
    return;
  }

  req.status = 'Aprobado';
  req.notes = `Aprobado por ${currentUser.name} (${new Date().toLocaleTimeString()}).`;
  pushNotification(`Solicitud ${req.id} (${req.assetName}) APROBADA para ${req.userName} (RF-017).`);
  saveState();
  renderAll();
};

window.rejectRequest = function (reqId) {
  if (document.getElementById('simulate-concurrency-lock').checked) {
    alert('Bloqueo de concurrencia (RF-019): Acción bloqueada por edición simultánea.');
    return;
  }
  // RF-003: Obligatoriedad de motivo en rechazo
  const reason = prompt('Ingresa el motivo obligatorio del rechazo (RF-003):');
  if (!reason || !reason.trim()) {
    alert('El rechazo requiere un motivo justificado obligatorio.');
    return;
  }

  const req = state.requests.find((r) => r.id === reqId);
  req.status = 'Rechazado';
  req.notes = `Rechazado por ${currentUser.name}. Motivo: ${reason.trim()}`;
  pushNotification(`Solicitud ${req.id} RECHAZADA. Motivo: ${reason.trim()} (RF-017).`);
  saveState();
  renderAll();
};

window.markNotPickedUp = function (reqId) {
  // RF-016: Liberar reserva no recogida
  const req = state.requests.find((r) => r.id === reqId);
  req.status = 'Cerrado';
  req.notes = `Marcado como 'No Recogido' tras margen de espera. Reserva liberada (RF-016).`;
  pushNotification(`Reserva ${req.id} liberada por 'No Recogido' (RF-016).`);
  saveState();
  renderAll();
};

window.closeLoan = function (reqId) {
  const req = state.requests.find((r) => r.id === reqId);
  req.status = 'Cerrado';
  req.notes += ` | Acta cerrada administrativamente por ${currentUser.name}.`;
  saveState();
  renderAll();
};

// CHECKLIST DIGITAL DE ENTREGA Y DEVOLUCIÓN (RF-005 / RF-006 / RF-007 / RF-020)
window.openChecklistModal = function (reqId, mode) {
  const req = state.requests.find((r) => r.id === reqId);
  const asset = state.assets.find((a) => a.id === req.assetId);
  const allItems = [...asset.mandatoryAccessories, ...req.selectedOptional];

  document.getElementById('modal-req-id').value = req.id;
  document.getElementById('modal-mode').value = mode;
  document.getElementById('modal-title').textContent =
    mode === 'delivery'
      ? `Acta de Entrega Digital · ${req.id} (RF-005)`
      : `Acta de Devolución y Novedades · ${req.id} (RF-005 / RF-020)`;

  document.getElementById('modal-subtitle').textContent =
    mode === 'delivery'
      ? 'Marca todos los componentes entregados y adjunta evidencia fotográfica simulada.'
      : 'Desmarca cualquier accesorio faltante (RF-006) y marca si hay daño técnico (RF-007). Ambos pueden tramitarse en paralelo (RF-020).';

  const container = document.getElementById('modal-checklist-items');
  container.innerHTML = allItems
    .map(
      (item) => `
      <div class="checklist-row">
        <label>
          <input type="checkbox" name="chk-acc" value="${item}" checked />
          ${item}
        </label>
        <span class="badge badge-ok">Presente</span>
      </div>
    `
    )
    .join('');

  const incidentBox = document.getElementById('return-incident-fields');
  document.getElementById('check-damage').checked = false;
  document.getElementById('damage-detail-box').classList.add('hidden');
  document.getElementById('damage-desc').value = '';

  if (mode === 'return') {
    incidentBox.classList.remove('hidden');
  } else {
    incidentBox.classList.add('hidden');
  }

  document.getElementById('checklist-modal').classList.remove('hidden');
};

document.getElementById('check-damage').addEventListener('change', (e) => {
  document.getElementById('damage-detail-box').classList.toggle('hidden', !e.target.checked);
});

window.closeChecklistModal = function () {
  document.getElementById('checklist-modal').classList.add('hidden');
};

document.getElementById('checklist-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const reqId = document.getElementById('modal-req-id').value;
  const mode = document.getElementById('modal-mode').value;
  const photo = document.getElementById('photo-evidence').value.trim();
  const req = state.requests.find((r) => r.id === reqId);
  const asset = state.assets.find((a) => a.id === req.assetId);

  const checkboxes = Array.from(document.querySelectorAll('input[name="chk-acc"]'));
  const missingItems = checkboxes.filter((cb) => !cb.checked).map((cb) => cb.value);

  if (mode === 'delivery') {
    if (missingItems.length > 0) {
      alert('No puedes completar la entrega si falta un componente obligatorio del checklist (RF-005).');
      return;
    }
    req.status = 'En Préstamo';
    req.notes = `Entregado por ${currentUser.name}. Evidencia: ${photo}.`;
    pushNotification(`Préstamo ${req.id} iniciado (En Préstamo). Evidencia: ${photo}.`);
  } else {
    // MODO DEVOLUCIÓN: soporta faltante (RF-006), daño (RF-007) o ambos en paralelo (RF-020)
    const hasDamage = document.getElementById('check-damage').checked;
    const damageDesc = document.getElementById('damage-desc').value.trim() || 'Revisión técnica preventiva solicitada.';

    if (!missingItems.length && !hasDamage) {
      req.status = 'Devuelto';
      req.notes = `Devuelto completo y sin novedades a ${currentUser.name}. Evidencia: ${photo}.`;
      pushNotification(`Préstamo ${req.id} devuelto a conformidad (Devuelto).`);
    } else {
      req.status = 'Con Novedad';
      const incidentSummary = [];

      if (missingItems.length) {
        incidentSummary.push(`Faltantes: ${missingItems.join(', ')} (Plazo resolución: 48h - RF-006)`);
        state.incidents.unshift({
          id: 'NOV-' + Math.floor(100 + Math.random() * 900),
          reqId: req.id,
          assetId: asset.id,
          assetName: asset.name,
          userName: req.userName,
          type: 'Faltante Inventario (RF-006)',
          detail: `Accesorios no devueltos: ${missingItems.join(', ')}. Plazo 48h.`,
          resolved: false
        });
        pushNotification(`ALERTA INVENTARIO (RF-006): Faltante en ${req.id} (${missingItems.join(', ')}).`);
      }

      if (hasDamage) {
        incidentSummary.push(`Daño reportado: ${damageDesc} (RF-007)`);
        asset.techStatus = 'Mantenimiento';
        state.incidents.unshift({
          id: 'TEC-' + Math.floor(100 + Math.random() * 900),
          reqId: req.id,
          assetId: asset.id,
          assetName: asset.name,
          userName: req.userName,
          type: 'Daño / Revisión Técnica (RF-007)',
          detail: damageDesc,
          resolved: false
        });
        pushNotification(`ALERTA SOPORTE TÉCNICO (RF-007): ${asset.name} ingresado a Mantenimiento.`);
      }

      req.notes = `Devuelto CON NOVEDAD (${incidentSummary.join(' | ')}). Evidencia: ${photo}.`;
    }
  }

  closeChecklistModal();
  saveState();
  renderAll();
});

// SIMULACIÓN AUTOMÁTICA DE VENCIMIENTOS (RN-012)
document.getElementById('btn-simulate-overdue').addEventListener('click', () => {
  let count = 0;
  state.requests.forEach((req) => {
    if (req.status === 'En Préstamo') {
      req.status = 'Vencido';
      req.notes += ' | Transición automática a VENCIDO (RN-012). Usuario bloqueado (RF-008).';
      pushNotification(`RN-012: Préstamo ${req.id} de ${req.userName} pasó a VENCIDO. Bloqueo activo.`);
      count++;
    }
  });
  if (count === 0) {
    alert('No hay préstamos "En Préstamo" activos para vencer. (Nota: EST-102 ya tiene un préstamo vencido de prueba).');
  } else {
    saveState();
    renderAll();
  }
});

// 7. SOPORTE TÉCNICO, REASIGNACIÓN Y ALTA DE ACTIVOS (RF-010 / RF-014 / RF-018)
function renderTechAndIncidents() {
  const incContainer = document.getElementById('incidents-list');
  if (!state.incidents.length) {
    incContainer.innerHTML = '<p class="help-text">Sin novedades pendientes en este momento.</p>';
  } else {
    incContainer.innerHTML = state.incidents
      .map(
        (inc) => `
        <div class="request-item">
          <div class="request-top">
            <strong>${inc.id} · ${inc.type}</strong>
            <span class="badge ${inc.resolved ? 'badge-ok' : 'badge-bad'}">${inc.resolved ? 'Resuelto' : 'Abierto'}</span>
          </div>
          <p class="request-meta">
            <strong>Préstamo:</strong> ${inc.reqId} | <strong>Equipo:</strong> ${inc.assetName} | <strong>Usuario:</strong> ${inc.userName}<br/>
            <strong>Detalle:</strong> ${inc.detail}
          </p>
          ${
            !inc.resolved
              ? `<button class="btn btn-secondary btn-sm" onclick="resolveIncident('${inc.id}')">Marcar Novedad Resuelta</button>`
              : ''
          }
        </div>
      `
      )
      .join('');
  }

  const techContainer = document.getElementById('tech-assets-list');
  techContainer.innerHTML = state.assets
    .map((asset) => {
      const futureAffected = state.requests.filter(
        (r) => r.assetId === asset.id && ['Solicitado', 'Aprobado'].includes(r.status)
      );

      return `
        <div class="request-item">
          <div class="request-top">
            <strong>${asset.id} · ${asset.name}</strong>
            <span class="badge ${asset.techStatus === 'Disponible' ? 'badge-ok' : 'badge-bad'}">${asset.techStatus}</span>
          </div>
          <div class="form-actions">
            <select id="tech-sel-${asset.id}" style="width:auto;">
              <option value="Disponible" ${asset.techStatus === 'Disponible' ? 'selected' : ''}>Disponible</option>
              <option value="Mantenimiento" ${asset.techStatus === 'Mantenimiento' ? 'selected' : ''}>Mantenimiento</option>
              <option value="Fuera de Servicio" ${asset.techStatus === 'Fuera de Servicio' ? 'selected' : ''}>Fuera de Servicio</option>
            </select>
            <button class="btn btn-primary btn-sm" onclick="updateAssetTechStatus('${asset.id}')">Actualizar Diagnóstico (RF-010)</button>
            ${
              asset.techStatus !== 'Disponible' && futureAffected.length > 0
                ? `<button class="btn btn-warning btn-sm" onclick="reassignFutureReservations('${asset.id}')">
                    Reasignar ${futureAffected.length} Reserva(s) Afectada(s) (RF-018)
                  </button>`
                : ''
            }
          </div>
        </div>
      `;
    })
    .join('');
}

window.resolveIncident = function (incId) {
  const inc = state.incidents.find((i) => i.id === incId);
  if (!inc) return;
  inc.resolved = true;
  pushNotification(`Novedad ${inc.id} (${inc.type}) cerrada por ${currentUser.name}.`);
  saveState();
  renderAll();
};

window.updateAssetTechStatus = function (assetId) {
  const asset = state.assets.find((a) => a.id === assetId);
  const newStatus = document.getElementById(`tech-sel-${asset.id}`).value;
  const diagnosis = prompt(`Diagnóstico técnico de ${currentUser.name} para estado "${newStatus}" (RF-010):`, 'Revisión técnica completada.');
  if (diagnosis === null) return;

  asset.techStatus = newStatus;
  pushNotification(
    `RF-010: ${asset.name} cambió a "${newStatus}" por ${currentUser.name} (${new Date().toLocaleDateString()}). Diagnóstico: ${diagnosis}`
  );
  saveState();
  renderAll();
};

window.reassignFutureReservations = function (brokenAssetId) {
  const brokenAsset = state.assets.find((a) => a.id === brokenAssetId);
  const replacement = state.assets.find(
    (a) => a.id !== brokenAssetId && a.category === brokenAsset.category && a.techStatus === 'Disponible'
  );

  if (!replacement) {
    alert('No hay otro equipo disponible de la misma categoría para reasignar automáticamente (RF-018).');
    return;
  }

  let moved = 0;
  state.requests.forEach((r) => {
    if (r.assetId === brokenAssetId && ['Solicitado', 'Aprobado'].includes(r.status)) {
      r.assetId = replacement.id;
      r.assetName = replacement.name;
      r.notes += ` | Reasignado desde ${brokenAsset.name} por indisponibilidad técnica (RF-018).`;
      moved++;
    }
  });

  pushNotification(`RF-018: ${moved} reserva(s) reasignada(s) automáticamente a ${replacement.name}.`);
  saveState();
  renderAll();
};

// REGISTRAR NUEVO EQUIPO / KIT (RF-014)
document.getElementById('new-asset-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('asset-name').value.trim();
  const category = document.getElementById('asset-category').value;
  const mandatory = document
    .getElementById('asset-mandatory')
    .value.split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const optional = document
    .getElementById('asset-optional')
    .value.split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const guide = document.getElementById('asset-guide').value.trim() || 'Uso académico estándar.';

  const newAsset = {
    id: 'EQ-' + String(state.assets.length + 1).padStart(2, '0'),
    name,
    category,
    techStatus: 'Disponible',
    mandatoryAccessories: mandatory,
    optionalAccessories: optional,
    guide
  };

  state.assets.push(newAsset);
  pushNotification(`RF-014: Nuevo equipo/kit "${name}" habilitado en el catálogo.`);
  e.target.reset();
  saveState();
  renderAll();
});

// 8. HISTORIAL CON FILTROS COMBINADOS (RF-009)
document.getElementById('btn-filter-history').addEventListener('click', renderHistory);

function renderHistory() {
  const userQ = document.getElementById('hist-user').value.trim().toLowerCase();
  const assetQ = document.getElementById('hist-asset').value.trim().toLowerCase();
  const statusQ = document.getElementById('hist-status').value;

  const filtered = state.requests.filter((r) => {
    const matchUser = !userQ || r.userName.toLowerCase().includes(userQ) || r.userCode.toLowerCase().includes(userQ);
    const matchAsset = !assetQ || r.assetName.toLowerCase().includes(assetQ);
    const matchStatus = !statusQ || r.status === statusQ;
    return matchUser && matchAsset && matchStatus;
  });

  const tbody = document.getElementById('history-tbody');
  tbody.innerHTML = filtered
    .map(
      (r) => `
      <tr>
        <td><strong>${r.id}</strong></td>
        <td>${r.userName} (${r.userCode})</td>
        <td>${r.assetName}</td>
        <td>${r.start.replace('T', ' ')}<br/>a ${r.end.replace('T', ' ')}</td>
        <td>${getStatusBadge(r.status)}</td>
        <td>${r.notes}</td>
      </tr>
    `
    )
    .join('');
}

// 9. NOTIFICACIONES INTERNAS (RF-017) Y REINICIO DE DEMO
function updateNotificationBadge() {
  document.getElementById('notif-count').textContent = state.notifications.length;
  const list = document.getElementById('notif-list');
  list.innerHTML = state.notifications
    .map(
      (n) => `
      <div class="notif-item">
        <small style="color:#64748b;">${n.time}</small>
        <p>${n.text}</p>
      </div>
    `
    )
    .join('');
}

window.toggleNotifications = function () {
  document.getElementById('notif-drawer').classList.toggle('hidden');
};
document.getElementById('btn-notifications').addEventListener('click', toggleNotifications);

document.getElementById('btn-reset-demo').addEventListener('click', () => {
  if (confirm('¿Restaurar todos los datos ficticios iniciales de prueba?')) {
    localStorage.removeItem(STORAGE_KEY);
    state = getInitialState();
    saveState();
    renderAll();
  }
});