import { Link, usePathname } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [hoveredLink, setHoveredLink] = useState(null);

  const links = [
    { name: 'Agendamentos', path: '/agendamentos' },
    { name: 'Clientes', path: '/clientes' },
    { name: 'Procedimentos', path: '/procedimentos' },
    { name: 'Financeiro', path: '/financeiro' },
  ];

  const handleMouseEnter = (link) => {
    setHoveredLink(link);
  };

  const handleMouseLeave = () => {
    setHoveredLink(null);
  };



 return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#6F4CA5',
        paddingHorizontal: 16,
        paddingVertical: 8,
        justifyContent: 'flex-end',
        height: 40,
      }}
    >
      <View style={{ flexDirection: 'row', gap: 24 }}>
        {links.map((link) => {
          const isActive = pathname === link.path;
          const isHovered = hoveredLink === link.path;

          return (
            <Link href={link.path} key={link.name} asChild>
              <Pressable
                onMouseEnter={() => setHoveredLink(link.path)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                <View
                  style={{
                    width: 90, 
                    height: 24, 
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: isActive || isHovered ? 'bold' : 'normal',
                      fontSize: 16,
                      transform: [{ scale: isActive || isHovered ? 1.15 : 1 }],
                      transitionDuration: '200ms',
                    }}
                  >
                    {link.name}
                  </Text>
                </View>
              </Pressable>
            </Link>
          );
        })}
      </View>
    </View>
  );
}