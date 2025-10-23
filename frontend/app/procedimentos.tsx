import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import Navbar from '@/components/artsalon/navbar';

const API = 'http://localhost:3000';
const TEMPOS = ['30m', '1:00h', '1:30h', '2:00h', '2:30h', '3:00h', '3:30h', '4:00h', '4:30h', '5:00h'];
const VALORES = Array.from({ length: 12 }, (_, i) => (80 + i * 20).toString());

interface Procedimento {
  id: number;
  nome: string;
  valorPequeno: number;
  tempoPequeno: string;
  valorMedio: number;
  tempoMedio: string;
  valorGrande: number;
  tempoGrande: string;
}

export default function Procedimentos() {
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [busca, setBusca] = useState('');
  const [modalVisivel, setModalVisivel] = useState(false);
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null);

  // modal único p/ sucesso/erro/validação (agora só abre ao clicar em Salvar)
  const [aviso, setAviso] = useState<string | null>(null);
  const [modalSelecionar, setModalSelecionar] = useState<{ campo: string; opcoes: string[] }>({ campo: '', opcoes: [] });

  const [valores, setValores] = useState({
    pequeno: '',
    tempoPequeno: '',
    medio: '',
    tempoMedio: '',
    grande: '',
    tempoGrande: '',
  });
  const [nome, setNome] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const filtro = busca.trim().toLowerCase();

  useEffect(() => {
    carregarProcedimentos();
  }, []);

  async function carregarProcedimentos() {
    const { data } = await axios.get(`${API}/procedimentos`);
    setProcedimentos(data);
  }

  function resetForm() {
    setNome('');
    setValores({
      pequeno: '',
      tempoPequeno: '',
      medio: '',
      tempoMedio: '',
      grande: '',
      tempoGrande: '',
    });
    setEditandoId(null);
  }

  function camposFaltantes(): string[] {
    const f: string[] = [];
    if (!nome.trim()) f.push('nome do procedimento');
    if (!valores.pequeno) f.push('valor (cabelo pequeno)');
    if (!valores.tempoPequeno) f.push('tempo (cabelo pequeno)');
    if (!valores.medio) f.push('valor (cabelo médio)');
    if (!valores.tempoMedio) f.push('tempo (cabelo médio)');
    if (!valores.grande) f.push('valor (cabelo grande)');
    if (!valores.tempoGrande) f.push('tempo (cabelo grande)');
    return f;
  }

  function formatarListaFaltantes(lista: string[]) {
    const msg = lista.join(', ').replace(/, ([^,]*)$/, ' e $1');
    return `Preencha: ${msg}.`;
  }

  function montarPayload() {
    return {
      nome,
      valorPequeno: parseFloat(valores.pequeno),
      tempoPequeno: valores.tempoPequeno,
      valorMedio: parseFloat(valores.medio),
      tempoMedio: valores.tempoMedio,
      valorGrande: parseFloat(valores.grande),
      tempoGrande: valores.tempoGrande,
    };
  }

  async function salvarProcedimentoConfirmado() {
    const payload = montarPayload();
    try {
      if (editandoId) {
        await axios.patch(`${API}/procedimentos/${editandoId}`, payload);
        setAviso('Procedimento atualizado com sucesso!');
      } else {
        await axios.post(`${API}/procedimentos`, payload);
        setAviso('Procedimento criado com sucesso!');
      }
      setModalVisivel(false);
      resetForm();
      carregarProcedimentos();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Erro ao salvar procedimento.';
      setAviso(msg);
    }
  }

  function solicitarSalvar() {
    const faltas = camposFaltantes();
    if (faltas.length) {
      setAviso(formatarListaFaltantes(faltas));
      return;
    }
    salvarProcedimentoConfirmado();
  }

  function editarProcedimento(procedimento: Procedimento) {
    setNome(procedimento.nome);
    setValores({
      pequeno: procedimento.valorPequeno.toString(),
      tempoPequeno: procedimento.tempoPequeno,
      medio: procedimento.valorMedio.toString(),
      tempoMedio: procedimento.tempoMedio,
      grande: procedimento.valorGrande.toString(),
      tempoGrande: procedimento.tempoGrande,
    });
    setEditandoId(procedimento.id);
    setModalVisivel(true);
  }

  async function confirmarExclusao() {
    if (idParaExcluir === null) return;
    try {
      await axios.delete(`${API}/procedimentos/${idParaExcluir}`);
      setIdParaExcluir(null);
      setAviso('Procedimento excluído com sucesso!');
      carregarProcedimentos();
    } catch {
      setAviso('Erro ao excluir procedimento.');
    }
  }

  const abrirSelecao = (campo: string) => {
    const opcoes = campo.startsWith('tempo') ? TEMPOS : VALORES.map(v => `R$ ${v},00`);
    setModalSelecionar({ campo, opcoes });
  };

  const selecionarOpcao = (opcao: string) => {
    setValores(v => ({
      ...v,
      [modalSelecionar.campo as keyof typeof v]: opcao.replace('R$ ', '').replace(',00', ''),
    }));
    setModalSelecionar({ campo: '', opcoes: [] });
  };

  const fmtBRL = (n: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0);

  return (
    <View style={estilos.container}>
      <Navbar />

      <ScrollView contentContainerStyle={estilos.scroll}>
        <View style={estilos.topo}>
          <TextInput
            style={estilos.inputBusca}
            placeholder="Pesquisar"
            value={busca}
            onChangeText={setBusca}
            placeholderTextColor="rgba(0,0,0,0.4)"
          />
          <TouchableOpacity style={estilos.botaoAdicionar} onPress={() => setModalVisivel(true)}>
            <Text style={estilos.textoBotao}>＋</Text>
          </TouchableOpacity>
        </View>

        <View style={estilos.listaCards}>
          {procedimentos
            .filter((p) => p.nome.toLowerCase().includes(filtro))
            .map((item) => (
              <View key={item.id} style={estilos.cartao}>
                <View style={estilos.headerCard}>
                  <Text style={estilos.nomeIcone}>{item.nome}</Text>
                  <View style={estilos.acoesIcone}>
                    <TouchableOpacity onPress={() => editarProcedimento(item)} style={estilos.clickable}>
                      <Text style={estilos.icone}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIdParaExcluir(item.id)} style={estilos.clickable}>
                      <Text style={estilos.icone}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {(['Pequeno', 'Medio', 'Grande'] as const).map((tam) => (
                  <Text key={tam} style={estilos.text}>
                    <Text style={{ fontWeight: '500' }}>{tam}</Text>
                    {`: ${fmtBRL(Number(item[`valor${tam}` as keyof Procedimento]))} | ${item[`tempo${tam}` as keyof Procedimento]}`}
                  </Text>
                ))}
              </View>
            ))}
        </View>
      </ScrollView>

      {/* criação e edição */}
      <Modal visible={modalVisivel} animationType="slide" transparent>
        <View style={estilos.modalFundo}>
          <View style={estilos.modalForm}>
            <Text style={estilos.modalTitulo}>{editandoId ? 'Editar' : 'Novo'} Procedimento</Text>

            <TextInput
              style={estilos.campo}
              placeholder="Nome"
              value={nome}
              onChangeText={setNome}
              placeholderTextColor="rgba(0,0,0,0.4)"
            />

            <TouchableOpacity onPress={() => abrirSelecao('pequeno')} style={[estilos.campo, estilos.clickable]}>
              <Text>{valores.pequeno ? `R$ ${valores.pequeno}` : 'Valor para cabelo pequeno'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => abrirSelecao('tempoPequeno')} style={[estilos.campo, estilos.clickable]}>
              <Text>{valores.tempoPequeno || 'Tempo para cabelo pequeno'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => abrirSelecao('medio')} style={[estilos.campo, estilos.clickable]}>
              <Text>{valores.medio ? `R$ ${valores.medio}` : 'Valor para cabelo médio'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => abrirSelecao('tempoMedio')} style={[estilos.campo, estilos.clickable]}>
              <Text>{valores.tempoMedio || 'Tempo para cabelo médio'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => abrirSelecao('grande')} style={[estilos.campo, estilos.clickable]}>
              <Text>{valores.grande ? `R$ ${valores.grande}` : 'Valor para cabelo grande'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => abrirSelecao('tempoGrande')} style={[estilos.campo, estilos.clickable]}>
              <Text>{valores.tempoGrande || 'Tempo para cabelo grande'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[estilos.btnFill, estilos.clickable]} onPress={solicitarSalvar}>
              <Text style={estilos.btnFillText}>{editandoId ? 'Atualizar' : 'Salvar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisivel(false)} style={{ marginTop: 10, alignItems: 'center' }}>
              <Text style={estilos.btnGhostText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* valor e tempo */}
      <Modal visible={!!modalSelecionar.campo} transparent animationType="fade">
        <TouchableOpacity style={estilos.modalFundo} onPress={() => setModalSelecionar({ campo: '', opcoes: [] })}>
          <View style={estilos.modalBoxSm}>
            <View>
              {modalSelecionar.opcoes.map((op) => (
                <TouchableOpacity key={op} onPress={() => selecionarOpcao(op)} style={[estilos.campo, estilos.clickable, { marginBottom: 8 }]}>
                  <Text>{op}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* confirmação de exclusão */}
      <Modal visible={idParaExcluir !== null} transparent animationType="fade">
        <View style={estilos.modalFundo}>
          <View style={estilos.modalBoxSm}>
            <Text style={estilos.modalTitulo}>Deseja excluir este procedimento?</Text>
            <View style={estilos.btnRow}>
              <TouchableOpacity style={[estilos.btnSm, estilos.btnGhost, estilos.clickable]} onPress={() => setIdParaExcluir(null)}>
                <Text style={estilos.btnGhostText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[estilos.btnSm, estilos.btnFill, estilos.clickable]} onPress={confirmarExclusao}>
                <Text style={estilos.btnFillText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* mensagens de sucesso, erro e validação (abre só ao clicar em Salvar) */}
      <Modal visible={!!aviso} transparent animationType="fade">
        <View style={estilos.modalFundo}>
          <View style={estilos.modalBoxSm}>
            <Text style={estilos.modalTitulo}>{aviso}</Text>
            <TouchableOpacity
              style={[estilos.btnSm, estilos.btnFill, estilos.clickable, { marginTop: 8 }]}
              onPress={() => setAviso(null)}
            >
              <Text style={estilos.btnFillText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1
  },
  scroll: {
    flexGrow: 1,
    backgroundColor: '#EFF1F7',
    padding: 20,
    paddingTop: 40
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
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
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)' as any,
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6
  },
  nomeIcone: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1
  },
  acoesIcone: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  icone: {
    fontSize: 18,
    marginLeft: 8
  },
  text: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.83)',
    marginBottom: 2
  },
  clickable: {
    cursor: 'pointer' as any
  },
  modalFundo: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalForm: {
    backgroundColor: '#fff',
    width: '30%',
    minWidth: 360,
    borderRadius: 10,
    padding: 20,
    boxShadow: '0 3px 10px rgba(0,0,0,0.1)' as any,
  },
  modalBoxSm: {
    backgroundColor: '#fff',
    width: '86%',
    maxWidth: 420,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
    boxShadow: '0 3px 10px rgba(0,0,0,0.1)' as any,
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
    marginBottom: 12,
    backgroundColor: '#fff'
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 4
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
