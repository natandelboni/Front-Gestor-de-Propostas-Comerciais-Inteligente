document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos do DOM
    const proposalListEl = document.getElementById('proposal-list');
    const proposalFormEl = document.getElementById('proposal-form');
    const welcomeMessageEl = document.getElementById('welcome-message');
    const newProposalBtn = document.getElementById('new-proposal-btn');
    const formTitleEl = document.getElementById('form-title');
    const totalValueEl = document.getElementById('total-value');
    const successProbabilityEl = document.getElementById('success-probability');
    const proposalItemsEl = document.getElementById('proposal-items');
    const addItemBtn = document.getElementById('add-item-btn');
    const aiGenerateBtn = document.getElementById('ai-generate-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    // Estado da aplicação (dados)
    let proposals = JSON.parse(localStorage.getItem('proposals')) || [
        { id: 1, title: 'Website Institucional para Café Gourmet', client: 'Aroma & Sabor Cafeteria', status: 'Enviada', description: 'Desenvolvimento completo de um site responsivo...', items: [{ description: 'Design UI/UX', quantity: 1, price: 1500 }, { description: 'Desenvolvimento Frontend', quantity: 1, price: 2500 }], total: 4000 },
        { id: 2, title: 'Sistema de Gestão de Estoque', client: 'LogiMax Transportes', status: 'Aceita', description: 'Criação de um sistema web para controle de estoque.', items: [{ description: 'Módulo de Cadastro', quantity: 1, price: 3000 }, { description: 'Módulo de Relatórios', quantity: 1, price: 2200 }], total: 5200 },
        { id: 3, title: 'Campanha de Marketing Digital', client: 'Moda Chic Boutique', status: 'Rascunho', description: 'Planejamento e execução de campanha de marketing.', items: [], total: 0 }
    ];
    let nextId = proposals.length > 0 ? Math.max(...proposals.map(p => p.id)) + 1 : 1;

    // --- FUNÇÕES PRINCIPAIS ---

    /** Salva as propostas no Local Storage do navegador */
    const saveProposals = () => {
        localStorage.setItem('proposals', JSON.stringify(proposals));
    };

    /** Renderiza a lista de propostas na tela */
    const renderProposalList = () => {
        proposalListEl.innerHTML = '';
        if (proposals.length === 0) {
            proposalListEl.innerHTML = '<p>Nenhuma proposta encontrada.</p>';
            return;
        }
        proposals.forEach(proposal => {
            const proposalCard = document.createElement('div');
            proposalCard.className = `proposal-item status-${proposal.status}`;
            proposalCard.dataset.id = proposal.id;

            proposalCard.innerHTML = `
                <h4>${proposal.title}</h4>
                <p>Cliente: ${proposal.client}</p>
                <div class="proposal-meta">
                    <span class="proposal-status status-${proposal.status}">${proposal.status}</span>
                </div>
                <div class="proposal-item-actions">
                  <button class="edit-btn" title="Editar">&#9998;</button>
                  <button class="delete-btn" title="Excluir">&#128465;</button>
                </div>
            `;
            proposalListEl.appendChild(proposalCard);
        });
    };
    
    /** Mostra o formulário e esconde a mensagem de boas-vindas */
    const showForm = () => {
        proposalFormEl.classList.remove('hidden');
        welcomeMessageEl.classList.add('hidden');
    };

    /** Esconde o formulário e mostra a mensagem de boas-vindas */
    const hideForm = () => {
        proposalFormEl.classList.add('hidden');
        welcomeMessageEl.classList.remove('hidden');
        proposalFormEl.reset();
        document.getElementById('proposal-id').value = '';
        proposalItemsEl.innerHTML = ''; // Limpa os itens
    };
    
    /** Preenche o formulário com os dados de uma proposta para edição */
    const populateForm = (proposal) => {
        formTitleEl.textContent = 'Editar Proposta';
        document.getElementById('proposal-id').value = proposal.id;
        document.getElementById('proposal-title').value = proposal.title;
        document.getElementById('client-name').value = proposal.client;
        document.getElementById('proposal-status').value = proposal.status;
        document.getElementById('proposal-description').value = proposal.description;
        
        proposalItemsEl.innerHTML = '';
        proposal.items.forEach(item => renderNewItemRow(item.description, item.quantity, item.price));
        
        updateTotal();
        updateSuccessProbability();
        showForm();
    };

    /** Adiciona uma nova linha de item no formulário */
    const renderNewItemRow = (description = '', quantity = 1, price = 0) => {
        const itemRow = document.createElement('div');
        itemRow.className = 'proposal-item-row';
        itemRow.innerHTML = `
            <input type="text" class="item-description" placeholder="Descrição do Serviço/Produto" value="${description}" required>
            <input type="number" class="item-quantity" placeholder="Qtd." min="1" value="${quantity}" required>
            <input type="number" class="item-price" placeholder="Preço Unitário" min="0" step="0.01" value="${price}" required>
            <button type="button" class="btn btn-danger remove-item-btn">-</button>
        `;
        proposalItemsEl.appendChild(itemRow);
    };

    /** Atualiza o valor total da proposta com base nos itens */
    const updateTotal = () => {
        let total = 0;
        document.querySelectorAll('.proposal-item-row').forEach(row => {
            const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            total += quantity * price;
        });
        totalValueEl.textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    /** SIMULAÇÃO: Atualiza a probabilidade de sucesso */
    const updateSuccessProbability = () => {
        const value = parseFloat(totalValueEl.textContent.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        let probability = 0;
        if (value > 0 && value < 5000) probability = Math.floor(Math.random() * 15) + 75; // 75-90%
        else if (value >= 5000) probability = Math.floor(Math.random() * 15) + 60; // 60-75%
        else probability = 0;
        successProbabilityEl.textContent = `${probability}%`;
    };

    // --- MANIPULADORES DE EVENTOS ---

    /** Manipula o clique no botão "Nova Proposta" */
    newProposalBtn.addEventListener('click', () => {
        formTitleEl.textContent = 'Nova Proposta';
        proposalFormEl.reset();
        document.getElementById('proposal-id').value = '';
        proposalItemsEl.innerHTML = '';
        renderNewItemRow(); // Adiciona uma linha de item inicial
        updateTotal();
        updateSuccessProbability();
        showForm();
    });

    /** Manipula o clique para editar ou deletar na lista */
    proposalListEl.addEventListener('click', (e) => {
        const proposalCard = e.target.closest('.proposal-item');
        if (!proposalCard) return;

        const proposalId = parseInt(proposalCard.dataset.id);

        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Tem certeza que deseja excluir esta proposta?')) {
                proposals = proposals.filter(p => p.id !== proposalId);
                saveProposals();
                renderProposalList();
                if (document.getElementById('proposal-id').value == proposalId) {
                    hideForm();
                }
            }
        } else if (e.target.classList.contains('edit-btn') || e.target === proposalCard) {
             const proposal = proposals.find(p => p.id === proposalId);
             if (proposal) populateForm(proposal);
        }
    });

    /** Salva a proposta (nova ou edição) */
    proposalFormEl.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('proposal-id').value;
        const items = [];
        document.querySelectorAll('.proposal-item-row').forEach(row => {
            items.push({
                description: row.querySelector('.item-description').value,
                quantity: parseFloat(row.querySelector('.item-quantity').value),
                price: parseFloat(row.querySelector('.item-price').value),
            });
        });
        
        const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

        const proposalData = {
            id: id ? parseInt(id) : nextId++,
            title: document.getElementById('proposal-title').value,
            client: document.getElementById('client-name').value,
            status: document.getElementById('proposal-status').value,
            description: document.getElementById('proposal-description').value,
            items: items,
            total: total
        };

        if (id) {
            proposals = proposals.map(p => p.id === proposalData.id ? proposalData : p);
        } else {
            proposals.push(proposalData);
        }

        saveProposals();
        renderProposalList();
        hideForm();
    });
    
    /** Cancela a edição/criação */
    cancelBtn.addEventListener('click', hideForm);

    /** Adiciona um novo item */
    addItemBtn.addEventListener('click', () => renderNewItemRow());

    /** Remove um item */
    proposalItemsEl.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item-btn')) {
            e.target.closest('.proposal-item-row').remove();
            updateTotal();
        }
    });

    /** Atualiza o total quando a quantidade ou preço mudam */
    proposalItemsEl.addEventListener('input', (e) => {
        if (e.target.classList.contains('item-quantity') || e.target.classList.contains('item-price')) {
            updateTotal();
            updateSuccessProbability();
        }
    });
    
    /** SIMULAÇÃO: Gera texto com "IA" */
    aiGenerateBtn.addEventListener('click', () => {
        const clientName = document.getElementById('client-name').value || 'o cliente';
        const proposalTitle = document.getElementById('proposal-title').value || 'este projeto';

        const aiText = `Esta proposta detalha o escopo para ${proposalTitle}. Nosso objetivo é fornecer uma solução completa e personalizada para ${clientName}, abordando os seguintes pontos principais:\n\n1. Análise de Requisitos e Planejamento Estratégico.\n2. Design de Interface (UI) e Experiência do Usuário (UX).\n3. Desenvolvimento e Implementação da Solução.\n4. Testes, Homologação e Lançamento.\n\nEstamos confiantes de que nossa expertise trará resultados excepcionais para sua empresa.`;
        
        document.getElementById('proposal-description').value = aiText;
    });

    // --- INICIALIZAÇÃO ---
    renderProposalList();
});