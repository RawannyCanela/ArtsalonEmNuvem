import React, { useState } from 'react';
import { Link, router } from "expo-router";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';

const Home = () => {
  const [isHovered, setIsHovered] = useState(false);

  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  return (
    <View style={styles.container}>
      <Link href={'/'}></Link>
      <Text style={styles.bemvindo}>Bem-Vindo ao</Text>
      <Text style={styles.subtitulo}>O seu gerenciador de salões</Text>

      <ImageBackground
        source={require('./imagens/artsalon.png')}
        style={styles.imagem}
        imageStyle={styles.imagemStyle}
      />

      <View style={styles.circulo}></View>

      <TouchableOpacity
        style={[styles.botao, isHovered && styles.hover]}
        onPress={() => router.push('/agendamentos')}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Text style={styles.texto}>Gerenciar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  bemvindo: {
    fontSize: 40,
    fontFamily: 'Poppins_700Bold',
    left: -520,
    top: -60,
    color: '#4B0082',
    marginBottom: 10,
  },
  imagem: {
    width: '80%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    left: -120,
    top: -40,
    zIndex: 10,
  },
  imagemStyle: {
    resizeMode: 'cover',
  },
  subtitulo: {
    fontSize: 20,
    fontFamily: 'Poppins_400Regular',
    fontWeight: 900,
    color: '#313F59',
    left: -520,
    top: 165,

  },
  circulo: {
    width: 900,
    height: 900,
    backgroundColor: '#5D3395',
    borderRadius: 700,
    position: 'absolute',
    right: -150,
    top: '20%',
    transform: [{ translateY: -100 }],
  },
  botao: {
    backgroundColor: '#6F4CA5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    left: -330,
    top: 30,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20
  },
  hover: {
    backgroundColor: '#4B0082',
    transform: [{ scale: 1.1 }],
  },
  texto: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
});

export default Home;
