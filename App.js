// App.js

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, FlatList, KeyboardAvoidingView, Platform, Dimensions, TextInput } from 'react-native'; // Added TextInput here
import * as SecureStore from 'expo-secure-store';

import TodoItem from './components/TodoItem';
import AddTodoForm from './components/AddTodoForm';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 400;

export default function App() {
  const [todos, setTodos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const TODO_STORE_KEY = 'my-todos';

  // Load todos from storage on app start
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const storedTodos = await SecureStore.getItemAsync(TODO_STORE_KEY);
        if (storedTodos) {
          setTodos(JSON.parse(storedTodos));
        }
      } catch (error) {
        console.error('Failed to load todos from SecureStore', error);
      }
    };
    loadTodos();
  }, []);

  // Save todos to storage whenever the list changes
  useEffect(() => {
    const saveTodos = async () => {
      try {
        await SecureStore.setItemAsync(TODO_STORE_KEY, JSON.stringify(todos));
      } catch (error) {
        console.error('Failed to save todos to SecureStore', error);
      }
    };
    saveTodos();
  }, [todos]);

  // Actions for the To-Do list
  const addTodo = (newTodoText) => {
    if (newTodoText.trim().length > 0) {
      setTodos([...todos, { id: Date.now().toString(), text: newTodoText, completed: false }]);
    }
  };

  const toggleComplete = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // Filtered list based on search query
  const filteredTodos = todos.filter(todo =>
    todo.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTodoItem = ({ item }) => (
    <TodoItem 
      item={item} 
      toggleComplete={toggleComplete} 
      deleteTodo={deleteTodo} 
    />
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
    >
      <SafeAreaView style={styles.container}>
        <Text style={isSmallScreen ? styles.titleSmall : styles.title}>To-Do App</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search to-dos..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FlatList
          data={filteredTodos}
          renderItem={renderTodoItem}
          keyExtractor={item => item.id}
          style={styles.list}
        />
        <AddTodoForm addTodo={addTodo} />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  titleSmall: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  list: {
    flex: 1,
    paddingHorizontal: 15,
  },
});