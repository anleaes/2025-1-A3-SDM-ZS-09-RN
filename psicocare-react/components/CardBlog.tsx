// components/CardBlog.tsx
import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet, View } from 'react-native';

type CardBlogProps = {
  title: string;
  image: any;
  onPress?: () => void; // ❗️onPress agora é opcional
};

export function CardBlog({ title, image, onPress }: CardBlogProps) {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper style={styles.card} {...(onPress ? { onPress, activeOpacity: 0.8 } : {})}>
      <Image source={image} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    height: 140,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  image: {
    width: '100%',
    height: '70%',
  },
  textContainer: {
    padding: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});


/* // components/CardBlog.tsx
import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet, View } from 'react-native';

type CardBlogProps = {
  title: string;
  image: any;
  onPress: () => void;
};

export function CardBlog({ title, image, onPress }: CardBlogProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image source={image} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    height: 140,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  image: {
    width: '100%',
    height: '70%',
  },
  textContainer: {
    padding: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
 */