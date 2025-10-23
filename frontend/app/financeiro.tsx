import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  Pressable,
} from 'react-native';
import axios from 'axios';
import Navbar from '@/components/artsalon/navbar';

const TIPOS = ['Entrada', 'Saída'];

export default function Financeiro() {
  const [financeiros, setFinanceiros] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalSelecionar, setModalSelecionar] = useState<{ campo: string; opcoes: string[] }>({
    campo: '',
    opcoes: [],
  });

  // confirmações
  const [modalExcluirVisivel, setModalExcluirVisivel] = useState(false);
  const [modalExcluirTodosVisivel, setModalExcluirTodosVisivel] = useState(false);
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null);

  // sucesso
  const [modalMensagem, setModalMensagem] = useState<string | null>(null);

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const filtro = busca.trim().toLowerCase();

  useEffect(() => {
    carregarFinanceiros();
  }, []);

  async function carregarFinanceiros() {
    try {
      const { data } = await axios.get('http://localhost:3000/financeiro');
      setFinanceiros(data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os dados financeiros.');
    }
  }

  function formatarValor(texto: string): string {
    const valorNumerico = texto.replace(/[^0-9]/g, '');
    if (!valorNumerico) return '';
    const numero = (parseFloat(valorNumerico) / 100).toFixed(2);
    return `R$ ${numero.replace('.', ',')}`;
  }

  function desformatarValor(v: string): number {
    return parseFloat(v.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
  }

  function validarCampos() {
    if (!descricao.trim()) return 'A descrição é obrigatória.';
    if (!valor) return 'O valor é obrigatório.';
    if (!tipo) return 'Selecione o tipo.';
    return '';
  }

  // sucesso
  async function salvarFinanceiro() {
    const erro = validarCampos();
    if (erro) {
      Alert.alert('Validação', erro);
      return;
    }

    const payload = {
      descricao,
      valor: desformatarValor(valor),
      tipo: tipo === 'Entrada',
    };

    try {
      if (editandoId) {
        await axios.patch(`http://localhost:3000/financeiro/${editandoId}`, payload);
        setModalMensagem('Registro atualizado com sucesso!');
      } else {
        await axios.post('http://localhost:3000/financeiro', payload);
        setModalMensagem('Registro criado com sucesso!');
      }

      limparFormulario();
      carregarFinanceiros();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Erro ao salvar registro.';
      Alert.alert('Erro', msg);
    }
  }

  function editarFinanceiro(item: any) {
    setDescricao(item.descricao);
    setValor(formatarValor(String(item.valor)));
    setTipo(item.tipo ? 'Entrada' : 'Saída');
    setEditandoId(item.id);
    setModalVisivel(true);
  }

  function limparFormulario() {
    setDescricao('');
    setValor('');
    setTipo('');
    setEditandoId(null);
    setModalVisivel(false);
  }

  //excluir
  function solicitarExclusao(id: number) {
    setIdParaExcluir(id);
    setModalExcluirVisivel(true);
  }
  async function confirmarExclusao() {
    if (idParaExcluir === null) return;
    try {
      await axios.delete(`http://localhost:3000/financeiro/${idParaExcluir}`);
      setModalExcluirVisivel(false);
      setIdParaExcluir(null);
      setModalMensagem('Registro excluído com sucesso!');
      carregarFinanceiros();
    } catch {
      Alert.alert('Erro', 'Erro ao excluir registro.');
    }
  }

  // excluir tudo
  function solicitarExclusaoTodos() {
    setModalExcluirTodosVisivel(true);
  }
  async function confirmarExclusaoTodos() {
    try {
      await axios.delete('http://localhost:3000/financeiro');
      setModalExcluirTodosVisivel(false);
      setModalMensagem('Todos os registros foram excluídos com sucesso!');
      carregarFinanceiros();
    } catch {
      Alert.alert('Erro', 'Erro ao excluir todos os registros.');
    }
  }

  const abrirSelecao = (campo: string) => {
    setModalSelecionar({ campo, opcoes: TIPOS });
  };

  const selecionarOpcao = (opcao: string) => {
    if (modalSelecionar.campo === 'tipo') {
      setTipo(opcao);
    }
    setModalSelecionar({ campo: '', opcoes: [] });
  };

  //calculo geral
  const totalEntrada = financeiros
    .filter((f) => f.tipo === true)
    .reduce((acc, f) => acc + Number(f.valor || 0), 0);

  const totalSaida = financeiros
    .filter((f) => f.tipo === false)
    .reduce((acc, f) => acc + Number(f.valor || 0), 0);

  return (
    <View style={{ flex: 1 }}>
      <Navbar />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: '#EFF1F7',
          padding: 20,
          paddingTop: Platform.OS === 'web' ? 40 : 20,
        }}
      >
        <View style={estilos.topo}>
          <TextInput
            style={estilos.inputBusca}
            placeholder="Pesquisar"
            value={busca}
            onChangeText={setBusca}
          />
          <TouchableOpacity style={estilos.botaoAdicionar} onPress={() => setModalVisivel(true)}>
            <Text style={estilos.textoBotao}>＋</Text>
          </TouchableOpacity>
          <Pressable
            onPress={solicitarExclusaoTodos}
            style={({ hovered }) => [estilos.botaoExcluirTudo, hovered && estilos.botaoExcluirHover]}
          >
            <Text style={estilos.textoBotaoExcluir}>Excluir Tudo</Text>
          </Pressable>
        </View>

        {/* valor total */}
        <View style={estilos.containerTotal}>
          <View style={[estilos.totalBox, { backgroundColor: '#E6F4EA' }]}>
            <Text style={[estilos.totalLabel, { color: '#2E7D32' }]}>Entradas</Text>
            <Text style={[{ color: '#2E7D32', fontSize: 18, fontWeight: 'bold' }]}>
              {`R$ ${totalEntrada.toFixed(2).replace('.', ',')}`}
            </Text>
          </View>

          <View style={[estilos.totalBox, { backgroundColor: '#FDECEA' }]}>
            <Text style={[estilos.totalLabel, { color: '#C62828' }]}>Saídas</Text>
            <Text style={[{ color: '#C62828', fontSize: 18, fontWeight: 'bold' }]}>
              {`R$ ${totalSaida.toFixed(2).replace('.', ',')}`}
            </Text>
          </View>

          <View style={[estilos.totalBox, { backgroundColor: '#6F4CA5' }]}>
            <Text style={[estilos.totalLabel, { color: '#fff' }]}>Total</Text>
            <Text style={estilos.valorTotal}>
              {`R$ ${(totalEntrada - totalSaida).toFixed(2).replace('.', ',')}`}
            </Text>
          </View>
        </View>

        <View style={estilos.listaCards}>
          {financeiros
            .filter((f) => f.descricao.toLowerCase().includes(filtro))
            .map((item) => (
              <View key={item.id} style={estilos.cartao}>
                <View style={estilos.headerCard}>
                  <Text style={estilos.nome}>{item.descricao}</Text>
                  <View style={estilos.acoesIcone}>
                    <TouchableOpacity onPress={() => editarFinanceiro(item)}>
                      <Text style={estilos.icone}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => solicitarExclusao(item.id)}>
                      <Text style={estilos.icone}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={estilos.valor}>
                  {`R$ ${Number(item.valor || 0).toFixed(2).replace('.', ',')}`}
                </Text>
                <Text style={{ color: item.tipo ? 'green' : 'red' }}>
                  {item.tipo ? 'Entrada' : 'Saída'}
                </Text>
              </View>
            ))}
        </View>
      </ScrollView>

      {/* cadastro/edição */}
      <Modal visible={modalVisivel} animationType="slide" transparent>
        <View style={estilos.modalFundo}>
          <View style={estilos.modalBox}>
            <Text style={estilos.modalTitulo}>{editandoId ? 'Editar' : 'Novo'} Registro</Text>
            <TextInput
              style={estilos.campo}
              placeholder="Descrição"
              value={descricao}
              onChangeText={setDescricao}
            />
            <TextInput
              style={estilos.campo}
              placeholder="Valor"
              value={valor}
              keyboardType="numeric"
              onChangeText={(text) => setValor(formatarValor(text))}
            />
            <TouchableOpacity onPress={() => abrirSelecao('tipo')} style={estilos.campo}>
              <Text>{tipo || 'Selecionar tipo'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={estilos.botaoRoxo} onPress={salvarFinanceiro}>
              <Text style={estilos.textoBotaoRoxo}>{editandoId ? 'Atualizar' : 'Salvar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={limparFormulario}>
              <Text style={estilos.cancelar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/*  tipo */}
      <Modal visible={!!modalSelecionar.campo} transparent animationType="fade">
        <TouchableOpacity
          style={estilos.modalFundo}
          onPress={() => setModalSelecionar({ campo: '', opcoes: [] })}
        >
          <View style={estilos.modalBox}>
            <FlatList
              data={modalSelecionar.opcoes}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => selecionarOpcao(item)} style={estilos.campo}>
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/*  excluir */}
      <Modal visible={modalExcluirVisivel} transparent animationType="fade">
        <View style={estilos.modalFundo}>
          <View style={estilos.modalBox}>
            <Text style={estilos.modalTitulo}>Deseja excluir este registro?</Text>
            <View style={estilos.acoesModalExcluir}>
              <TouchableOpacity onPress={() => setModalExcluirVisivel(false)}>
                <Text style={estilos.cancelar}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={estilos.botaoRoxo} onPress={confirmarExclusao}>
                <Text style={estilos.textoBotaoRoxo}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/*  excluir tudo (confirmação) */}
      <Modal visible={modalExcluirTodosVisivel} transparent animationType="fade">
        <View style={estilos.modalFundo}>
          <View style={estilos.modalBox}>
            <Text style={estilos.modalTitulo}>Deseja excluir todos os registros?</Text>
            <View style={estilos.acoesModalExcluir}>
              <TouchableOpacity onPress={() => setModalExcluirTodosVisivel(false)}>
                <Text style={estilos.cancelar}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={estilos.botaoRoxo} onPress={confirmarExclusaoTodos}>
                <Text style={estilos.textoBotaoRoxo}>Excluir Tudo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* sucesso */}
      <Modal visible={!!modalMensagem} transparent animationType="fade">
        <View style={estilos.modalFundo}>
          <View style={estilos.modalBox}>
            <Text style={estilos.modalTitulo}>{modalMensagem}</Text>
            <TouchableOpacity style={[estilos.botaoRoxo, { marginTop: 8 }]} onPress={() => setModalMensagem(null)}>
              <Text style={estilos.textoBotaoRoxo}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const estilos = StyleSheet.create({
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
  textoBotao: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: -5
  },

  botaoExcluirTudo: {
    backgroundColor: '#6F4CA5',
    opacity: 0.4,
    width: 100,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 1077,
  },
  textoBotaoExcluir: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: -6,
    marginBottom: -3
  },
  botaoExcluirHover: {
    backgroundColor: '#6F4CA5',
    opacity: 0.9
  },
  containerTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  totalBox: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  valor: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4
  },
  valorTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  },
  listaCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
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
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  nome: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1
  },
  acoesIcone: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  icone: {
    fontSize: 16,
    marginLeft: 8,
    marginTop: -2
  },
  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalBox: {
    backgroundColor: '#fff',
    width: '30%',
    borderRadius: 10,
    padding: 20
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  campo: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  botaoRoxo: {
    backgroundColor: '#6F4CA5',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  textoBotaoRoxo: {
    color: '#fff',
    fontWeight: 'bold'
  },
  cancelar: {
    color: '#6F4CA5',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10
  },
  acoesModalExcluir: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
});
