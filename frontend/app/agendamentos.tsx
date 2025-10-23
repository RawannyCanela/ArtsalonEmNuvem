import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import axios from 'axios';
import Navbar from '@/components/artsalon/navbar';
import { Calendar, LocaleConfig, DateData } from 'react-native-calendars';

LocaleConfig.locales['pt'] = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],
  monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  dayNames: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt';

type TAgendamento = {
  id: number;
  data: string;
  horario: string;
  tamanhoCabelo?: string;
  observacao?: string;
  valor?: number | string;
  pago?: boolean;
  cliente: { id: number; nome: string };
  procedimento: { id: number; nome: string };
};

const api = axios.create({ baseURL: 'http://localhost:3000' });

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState<TAgendamento[]>([]);
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [clientes, setClientes] = useState<any[]>([]);
  const [procedimentos, setProcedimentos] = useState<any[]>([]);
  const [buscaCliente, setBuscaCliente] = useState('');

  const [form, setForm] = useState({
    clienteId: '' as number | string,
    procedimentoId: '' as number | string,
    horario: '',
    tamanhoCabelo: '',
  });

  const [marcacoes, setMarcacoes] = useState<any>({});
  const [modalConfirmacao, setModalConfirmacao] = useState<{ tipo: 'excluir' | 'pagar', id?: number } | null>(null);
  const [modalMensagem, setModalMensagem] = useState<string | null>(null);
  const [modalAviso, setModalAviso] = useState<string | null>(null);

  const calendarTheme = {
    backgroundColor: '#fff',
    calendarBackground: '#fff',
    textSectionTitleColor: '#6F4CA5',
    selectedDayBackgroundColor: '#6F4CA5',
    selectedDayTextColor: '#fff',
    todayTextColor: '#6F4CA5',
    dayTextColor: '#333',
    textDisabledColor: '#CCC',
    arrowColor: '#6F4CA5',
    monthTextColor: '#6F4CA5',
    indicatorColor: '#6F4CA5',
    textDayFontWeight: '500',
    textMonthFontSize: 20,
    textMonthFontWeight: 'bold',
    textDayFontSize: 16,
    textDayHeaderFontSize: 14,
  };

  useEffect(() => {
    carregarAgendamentos();
    carregarClientes();
    carregarProcedimentos();
  }, []);

  async function carregarClientes() {
    try {
      const { data } = await api.get('/clientes');
      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  }

  async function carregarProcedimentos() {
    try {
      const { data } = await api.get('/procedimentos');
      setProcedimentos(data || []);
    } catch (error) {
      console.error('Erro ao carregar procedimentos:', error);
    }
  }

  async function carregarAgendamentos() {
    try {
      const { data } = await api.get('/agendamentos');
      setAgendamentos(data || []);
      gerarMarcacoes(data || [], dataSelecionada);
    } catch {
      setModalAviso('Não foi possível carregar os agendamentos.');
    }
  }

  function gerarMarcacoes(lista: TAgendamento[], diaSelecionado: string) {
    const marks = lista.reduce((acc: any, a) => {
      const dots = acc[a.data]?.dots || [];
      acc[a.data] = { marked: true, dots: [...dots, { color: '#6F4CA5' }] };
      return acc;
    }, {} as Record<string, any>);

    marks[diaSelecionado] = {
      ...(marks[diaSelecionado] || {}),
      selected: true,
      selectedColor: '#6F4CA5',
    };
    setMarcacoes(marks);
  }

  const agendamentosDoDia = agendamentos.filter((a) => a.data === dataSelecionada);

  function abrirModalNovo() {
    setEditandoId(null);
    setForm({ clienteId: '', procedimentoId: '', horario: '', tamanhoCabelo: '' });
    setModalVisivel(true);
  }

  function editarAgendamento(a: TAgendamento) {
    setForm({
      clienteId: Number(a.cliente.id),
      procedimentoId: Number(a.procedimento.id),
      horario: a.horario,
      tamanhoCabelo: a.tamanhoCabelo || '',
    });
    setEditandoId(Number(a.id));
    setModalVisivel(true);
  }

  function validarFormulario() {
    const faltantes: string[] = [];
    if (!form.horario) faltantes.push('horário');
    if (!form.clienteId) faltantes.push('cliente');
    if (!form.procedimentoId) faltantes.push('procedimento');
    if (!form.tamanhoCabelo) faltantes.push('tamanho do cabelo');

    if (faltantes.length) {
      const lista = faltantes.join(', ').replace(/, ([^,]*)$/, ' e $1');
      setModalAviso(`Selecione ${lista}.`);
      return false;
    }
    return true;
  }

  async function salvarAgendamento() {
    if (!validarFormulario()) return;

    const payload = {
      clienteId: Number(form.clienteId),
      procedimentoId: Number(form.procedimentoId),
      horario: form.horario,
      tamanhoCabelo: String(form.tamanhoCabelo).toLowerCase(),
      data: dataSelecionada,
    };

    try {
      setSalvando(true);
      if (editandoId !== null) {
        await api.patch(`/agendamentos/${editandoId}`, payload);
        setModalVisivel(false);
        setEditandoId(null);
        setForm({ clienteId: '', procedimentoId: '', horario: '', tamanhoCabelo: '' });
        await carregarAgendamentos();
        setModalMensagem('Agendamento atualizado com sucesso!');
      } else {
        await api.post('/agendamentos', payload);
        setModalVisivel(false);
        setForm({ clienteId: '', procedimentoId: '', horario: '', tamanhoCabelo: '' });
        await carregarAgendamentos();
        setModalMensagem('Agendamento criado com sucesso!');
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Não foi possível salvar agendamento.';
      setModalAviso(Array.isArray(msg) ? msg.join('\n') : String(msg));
    } finally {
      setSalvando(false);
    }
  }

  function confirmarExcluir(id: number) {
    setModalConfirmacao({ tipo: 'excluir', id });
  }

  async function excluirAgendamento(id?: number) {
    if (!id) return setModalConfirmacao(null);
    try {
      await api.delete(`/agendamentos/${id}`);
      await carregarAgendamentos();
      setModalConfirmacao(null);
      setModalMensagem('Agendamento excluído com sucesso!');
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Não foi possível excluir agendamento.';
      setModalAviso(Array.isArray(msg) ? msg.join('\n') : String(msg));
    }
  }

  function confirmarPagamento(id: number) {
    setModalConfirmacao({ tipo: 'pagar', id });
  }

  async function pagarAgendamento(id?: number) {
    if (!id) return setModalConfirmacao(null);
    try {
      await api.patch(`/agendamentos/${id}/pagar`);
      await carregarAgendamentos();
      setModalConfirmacao(null);
      setModalMensagem('Pagamento confirmado com sucesso!');
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Não foi possível confirmar pagamento.';
      setModalAviso(Array.isArray(msg) ? msg.join('\n') : String(msg));
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Navbar />
      <View style={styles.container}>
        <View style={styles.colunaCalendario}>
          <Calendar
            style={styles.calendario}
            theme={calendarTheme}
            onDayPress={(day: DateData) => {
              setDataSelecionada(day.dateString);
              gerarMarcacoes(agendamentos, day.dateString);
            }}
            markingType="multi-dot"
            markedDates={marcacoes}
          />
          <TouchableOpacity style={styles.botaoRoxo} onPress={abrirModalNovo}>
            <Text style={styles.textoBotaoRoxo}>＋ Agendar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.coluna}>
          <ScrollView style={{ flex: 1 }}>
            {agendamentosDoDia.map((a) => (
              <View key={a.id} style={styles.card}>
                <View style={styles.cardTopo}>
                  <Text style={styles.nome}>{a.horario} - {a.procedimento?.nome}</Text>
                  <View style={styles.acoes}>
                    <TouchableOpacity onPress={() => editarAgendamento(a)}>
                      <Text style={styles.icone}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => confirmarExcluir(a.id)}>
                      <Text style={styles.icone}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text>🙋‍♂️ {a.cliente?.nome}</Text>
                <Text>💇 {a.tamanhoCabelo || '-'}</Text>
                <Text>💰 R$ {Number(a.valor || 0).toFixed(2)}</Text>
                {a.observacao ? <Text>📝 {a.observacao}</Text> : null}

                <View style={{ alignItems: 'flex-start', marginTop: 10 }}>
                  <TouchableOpacity
                    style={[styles.botaoPagamento, a.pago && styles.botaoPagamentoDesativado]}
                    disabled={!!a.pago}
                    onPress={() => confirmarPagamento(a.id)}
                  >
                    <Text style={[styles.textoBotaoPagamento, a.pago && { color: '#666' }]}>
                      {a.pago ? 'Pago' : 'Confirmar Pagamento'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* form */}
      <Modal visible={modalVisivel} animationType="slide" transparent>
        <View style={styles.modalFundo}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitulo}>
              {editandoId !== null ? 'Editar Agendamento' : 'Novo Agendamento'}
            </Text>

            <View style={styles.linha}>
              {/* Horário */}
              <View style={[styles.coluna, styles.colunaAlinhada, { maxWidth: 90 }]}>
                <Text style={styles.label}>Horário</Text>
                <ScrollView style={[styles.listaVertical, { maxHeight: 328 }]}>
                  {[
                    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
                    '15:00', '15:30', '16:00'
                  ].map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[styles.selecaoHorario, form.horario === item && styles.selecaoAtivo]}
                      onPress={() => setForm((f) => ({ ...f, horario: item }))}
                    >
                      <Text style={{ color: form.horario === item ? '#fff' : '#000' }}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* cliente */}
              <View style={[styles.coluna, styles.colunaAlinhada, { flex: 2 }]}>
                <Text style={styles.label}>Cliente</Text>
                <TextInput
                  style={[styles.inputBusca, { maxHeight: 35, marginTop: 10 }]}
                  placeholder="Pesquisar..."
                  value={buscaCliente}
                  onChangeText={setBuscaCliente}
                />
                <ScrollView style={[styles.listaVertical, { maxHeight: 285 }]}>
                  {clientes
                    .filter((c) => c.nome?.toLowerCase().includes(buscaCliente.toLowerCase()))
                    .map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.selecao, form.clienteId == item.id && styles.selecaoAtivo]}
                        onPress={() => setForm((f) => ({ ...f, clienteId: Number(item.id) }))}
                      >
                        <Text style={{ color: form.clienteId == item.id ? '#fff' : '#000' }}>{item.nome}</Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>

              {/* procedimento e tamanho */}
              <View style={[styles.coluna, styles.colunaAlinhada, { maxWidth: 220 }]}>
                <Text style={styles.label}>Procedimento</Text>
                <ScrollView style={[styles.listaVertical, { maxHeight: 190 }]}>
                  {procedimentos.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.selecaoPequena, form.procedimentoId == item.id && styles.selecaoAtivo]}
                      onPress={() => setForm((f) => ({ ...f, procedimentoId: Number(item.id) }))}
                    >
                      <Text style={{ color: form.procedimentoId == item.id ? '#fff' : '#000' }}>{item.nome}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={[styles.label, { marginTop: 12 }]}>Tamanho</Text>
                <ScrollView style={[styles.listaVertical, { maxHeight: 190 }]}>
                  {['Pequeno', 'Medio', 'Grande'].map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[styles.selecaoPequena, form.tamanhoCabelo === item && styles.selecaoAtivo]}
                      onPress={() => setForm((f) => ({ ...f, tamanhoCabelo: item }))}
                    >
                      <Text style={{ color: form.tamanhoCabelo === item ? '#fff' : '#000' }}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.botoesModal}>
              <TouchableOpacity
                style={[styles.botaoRoxo, salvando && { opacity: 0.6 }]}
                onPress={salvarAgendamento}
                disabled={salvando}
              >
                <Text style={styles.textoBotaoRoxo}>{salvando ? 'Salvando...' : 'Salvar'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setModalVisivel(false)}>
                <Text style={styles.cancelar}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* mensagem excluir/pagar */}
      <Modal visible={!!modalConfirmacao} transparent animationType="fade">
        <View style={styles.modalFundo}>
          <View style={styles.modalBoxSm}>
            <Text style={styles.modalTitulo}>
              {modalConfirmacao?.tipo === 'excluir' && 'Deseja realmente excluir este agendamento?'}
              {modalConfirmacao?.tipo === 'pagar' && 'Deseja realmente confirmar o pagamento?'}
            </Text>

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.btnSm, styles.btnFill]}
                onPress={() => {
                  if (modalConfirmacao?.tipo === 'excluir') return excluirAgendamento(modalConfirmacao.id);
                  if (modalConfirmacao?.tipo === 'pagar') return pagarAgendamento(modalConfirmacao.id);
                }}
              >
                <Text style={styles.btnFillText}>Sim</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.btnSm, styles.btnGhost]} onPress={() => setModalConfirmacao(null)}>
                <Text style={styles.btnGhostText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* sucesso */}
      <Modal visible={!!modalMensagem} transparent animationType="fade">
        <View style={styles.modalFundo}>
          <View style={styles.modalBoxSm}>
            <Text style={styles.modalTitulo}>{modalMensagem}</Text>
            <TouchableOpacity style={[styles.btnSm, styles.btnFill, { marginTop: 8 }]} onPress={() => setModalMensagem(null)}>
              <Text style={styles.btnFillText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/*  aviso/validação */}
      <Modal visible={!!modalAviso} transparent animationType="fade">
        <View style={styles.modalFundo}>
          <View style={styles.modalBoxSm}>
            <Text style={styles.modalTitulo}>{modalAviso}</Text>
            <TouchableOpacity style={[styles.btnSm, styles.btnFill, { marginTop: 8 }]} onPress={() => setModalAviso(null)}>
              <Text style={styles.btnFillText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#EFF1F7'
  },
  colunaCalendario: {
    flex: 2,
    marginRight: 15
  },
  calendario: {
    borderRadius: 16,
    padding: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 35,
    paddingBottom: 130,
    paddingTop: 80,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  nome: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1
  },
  acoes: {
    flexDirection: 'row'
  },
  icone: {
    fontSize: 18,
    marginLeft: 8
  },
  botaoPagamento: {
    backgroundColor: '#6F4CA5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  botaoPagamentoDesativado: {
    backgroundColor: '#CCC'
  },
  textoBotaoPagamento: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12
  },
  modalFundo: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center'
  },
  modalBox: {
    backgroundColor: '#fff',
    width: '90%',
    maxWidth: 800,
    borderRadius: 12,
    padding: 30,
    maxHeight: 1000,
    height: '78%',
    paddingBottom: 40,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },

  modalBoxSm: {
    backgroundColor: '#fff',
    width: '86%',
    maxWidth: 420,
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  inputBusca: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#6F4CA5',
    marginBottom: 10,
    fontSize: 14,
    width: '100%',
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  coluna: {
    flex: 1,
    marginHorizontal: 5
  },
  listaVertical: {
    maxHeight: 200,
    marginTop: 5
  },
  selecao: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CCC',
    marginVertical: 4
  },
  selecaoAtivo: {
    backgroundColor: '#6F4CA5',
    borderColor: '#6F4CA5'
  },

  botoesModal: {
    marginTop: 10,
    alignItems: 'center'
  },
  botaoRoxo: {
    backgroundColor: '#6F4CA5',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%'
  },
  textoBotaoRoxo: {
    color: '#fff',
    fontWeight: 'bold'
  },
  cancelar: {
    color: '#6F4CA5',
    fontWeight: 'bold',
    marginTop: 12
  },

  colunaAlinhada: {
    justifyContent: 'center'
  },
  label: {
    fontWeight: 'bold',
    marginTop: 5,
    alignSelf: 'flex-start'
  },
  selecaoHorario: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCC',
    marginVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
  },
  selecaoPequena: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CCC',
    marginVertical: 4,
  },

  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 6
  },
  btnSm: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center'
  },
  btnFill: {
    backgroundColor: '#6F4CA5'
  },
  btnFillText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  btnGhost: {
    borderWidth: 1,
    borderColor: '#6F4CA5',
    backgroundColor: '#fff'
  },
  btnGhostText: {
    color: '#6F4CA5',
    fontWeight: 'bold'
  },
});
