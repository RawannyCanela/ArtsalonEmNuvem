import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
} from 'react-native';
import Navbar from '@/components/artsalon/navbar';

const API_URL = 'http://localhost:3000/clientes';

interface Cliente {
  id: number | null;
  nome: string;
  telefone: string;
}

const TelaClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState('');
  const [modalCadastroVisivel, setModalCadastroVisivel] = useState(false);
  const [clienteAtual, setClienteAtual] = useState<Cliente>({ id: null, nome: '', telefone: '' });
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  useEffect(() => {
    carregarClientes();
  }, []);
  async function api(input: RequestInfo, init?: RequestInit) {
    const res = await fetch(input, init);
    if (!res.ok) {
      let msg = 'Erro inesperado.';
      try {
        const data = await res.json();
        msg =
          (Array.isArray(data?.message) ? data.message.join('\n') : data?.message) ||
          (data && typeof data === 'string' ? data : msg);
      } catch {
        try {
          const t = await res.text();
          msg = t || msg;
        } catch { }
      }
      throw new Error(msg);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }

  async function carregarClientes() {
    try {
      const dados = await api(API_URL);
      setClientes(dados || []);
    } catch (e: any) {
      setAviso(e.message || 'Não foi possível carregar os clientes.');
    }
  }

  function formatarTelefone(valor: string) {
    const n = valor.replace(/\D/g, '').slice(0, 11);
    if (n.length <= 2) return n;
    if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
    return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
  }

  function atualizarTelefone(texto: string) {
    setClienteAtual((c) => ({ ...c, telefone: formatarTelefone(texto) }));
  }

  async function salvarCliente() {
    if (!clienteAtual.nome.trim() || !clienteAtual.telefone.trim()) {
      return setAviso('Preencha todos os campos do cliente.');
    }

    const telefoneSemMascara = clienteAtual.telefone.replace(/\D/g, '');
    const payload = { ...clienteAtual, telefone: telefoneSemMascara };

    try {
      if (clienteAtual.id) {
        await api(`${API_URL}/${clienteAtual.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        setAviso('Cliente atualizado com sucesso!');
      } else {
        await api(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        setAviso('Cliente cadastrado com sucesso!');
      }
      setModalCadastroVisivel(false);
      setClienteAtual({ id: null, nome: '', telefone: '' });
      carregarClientes();
    } catch (e: any) {
      setAviso(e.message || 'Falha ao salvar cliente.');
    }
  }

  async function excluirCliente() {
    if (idParaExcluir === null) return;
    try {
      const resultado = await api(`${API_URL}/${idParaExcluir}`, { method: 'DELETE' });
      setIdParaExcluir(null);
      setAviso(resultado?.message || 'Cliente removido com sucesso.');
      carregarClientes();
    } catch (e: any) {
      setAviso(e.message || 'Não foi possível excluir o cliente.');
    }
  }

  const clientesFiltrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <>
      <Navbar />

      <View style={estilos.container}>
        <View style={estilos.topo}>
          <TextInput
            style={estilos.inputBusca}
            placeholder="Pesquisar"
            placeholderTextColor="rgba(0,0,0,0.4)"
            value={busca}
            onChangeText={setBusca}
          />
          <TouchableOpacity
            style={estilos.botaoAdicionar}
            onPress={() => {
              setClienteAtual({ id: null, nome: '', telefone: '' });
              setModalCadastroVisivel(true);
            }}
          >
            <Text style={estilos.textoBotao}>＋</Text>
          </TouchableOpacity>
        </View>

        {/* visualização geral */}
        <FlatList
          data={clientesFiltrados}
          keyExtractor={(item, index) => `${item.id ?? `temp-${index}`}`}
          numColumns={2}
          columnWrapperStyle={estilos.grid}
          renderItem={({ item }) => (
            <View style={estilos.cartao}>
              <View style={estilos.cartaoTopo}>
                <Text style={estilos.nome}>{item.nome}</Text>
                <View style={estilos.acoes}>
                  <TouchableOpacity
                    onPress={() => {
                      setClienteAtual({
                        id: item.id,
                        nome: item.nome,
                        telefone: formatarTelefone(item.telefone),
                      });
                      setModalCadastroVisivel(true);
                    }}
                  >
                    <Text style={estilos.icone}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setIdParaExcluir(item.id!)}
                  >
                    <Text style={estilos.icone}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={estilos.telefone}>{formatarTelefone(item.telefone)}</Text>
            </View>
          )}
        />

        {/* confirmação para excluir */}
        <Modal visible={idParaExcluir !== null} animationType="fade" transparent>
          <View style={estilos.modalFundo}>
            <View style={estilos.modalBoxSm}>
              <Text style={estilos.modalTitulo}>Deseja excluir este cliente?</Text>
              <View style={estilos.btnRow}>
                <TouchableOpacity
                  style={[estilos.btnSm, estilos.btnGhost]}
                  onPress={() => setIdParaExcluir(null)}
                >
                  <Text style={estilos.btnGhostText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[estilos.btnSm, estilos.btnFill]} onPress={excluirCliente}>
                  <Text style={estilos.btnFillText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* cadastro e edição */}
        <Modal visible={modalCadastroVisivel} animationType="slide" transparent>
          <View style={estilos.modalFundo}>
            <View style={estilos.modalForm}>
              <Text style={estilos.modalTitulo}>
                {clienteAtual.id ? 'Editar Cliente' : 'Novo Cliente'}
              </Text>
              <TextInput
                style={estilos.campo}
                placeholder="Nome"
                value={clienteAtual.nome}
                onChangeText={(nome) => setClienteAtual({ ...clienteAtual, nome })}
                placeholderTextColor="rgba(0,0,0,0.4)"
              />
              <TextInput
                style={estilos.campo}
                placeholder="Telefone"
                keyboardType="numeric"
                value={clienteAtual.telefone}
                onChangeText={atualizarTelefone}
                maxLength={15}
                placeholderTextColor="rgba(0,0,0,0.4)"
              />
              <TouchableOpacity style={estilos.btnFill} onPress={salvarCliente}>
                <Text style={estilos.btnFillText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setModalCadastroVisivel(false)}
                style={{ marginTop: 10, alignItems: 'center' }}
              >
                <Text style={estilos.btnGhostText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* modal para sucesso */}
        <Modal visible={!!aviso} animationType="fade" transparent>
          <View style={estilos.modalFundo}>
            <View style={estilos.modalBoxSm}>
              <Text style={estilos.modalTitulo}>{aviso}</Text>
              <TouchableOpacity
                style={[estilos.btnSm, estilos.btnFill, { marginTop: 8 }]}
                onPress={() => setAviso(null)}
              >
                <Text style={estilos.btnFillText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

export default TelaClientes;

const estilos = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#EFF1F7' },
  topo: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  inputBusca: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
    fontSize: 16,
    height: 35,
    maxWidth: '18%',
  },
  botaoAdicionar: {
    backgroundColor: '#6F4CA5',
    width: 35,
    height: 35,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotao: { color: '#fff', fontSize: 30, fontWeight: 'bold', marginTop: -5 },

  grid: { justifyContent: 'space-between' },
  cartao: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 7,
    width: '49%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cartaoTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nome: { fontWeight: 'bold', fontSize: 16, maxWidth: '70%' },
  telefone: { fontSize: 14, color: 'rgba(0, 0, 0, 0.83)' },
  acoes: { flexDirection: 'row' },
  icone: { fontSize: 16, marginLeft: 8, marginTop: -9 },

  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalForm: {
    backgroundColor: '#fff',
    width: '30%',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  modalBoxSm: {
    backgroundColor: '#fff',
    width: '86%',
    maxWidth: 420,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center'
  },
  campo: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff'
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10
  },
  btnSm: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  btnFill: {
    backgroundColor: '#6F4CA5',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10
  },
  btnFillText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  btnGhost: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#6F4CA5',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10
  },
  btnGhostText: {
    color: '#6F4CA5',
    fontWeight: 'bold'
  },
});
