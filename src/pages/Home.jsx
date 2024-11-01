import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';

Modal.setAppElement('#root'); 

function Home() {
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [playerName, setPlayerName] = useState('');
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [posicao, setPosicao] = useState('');
    const [idTime, setIdTime] = useState('');

    const fetchTeams = async () => {
        try {
            const response = await axios.get('http://localhost:8080/time');
            setTeams(response.data); 
        } catch (error) {
            console.error('Erro ao buscar os times:', error);
        }
    };

    const fetchPlayers = async () => {
        const playerRequests = teams.map((team) =>
            axios.get(`http://localhost:8080/time/jogadores/${team.id}`)
        );

        try {
            const playersResponses = await Promise.all(playerRequests);
            const playersData = playersResponses.map(response => response.data);
            setPlayers(playersData);
        } catch (error) {
            console.error('Erro ao buscar os jogadores:', error);
        }
    };

    const enviarDadosProBack = async (e) => {
        e.preventDefault();
        const playerData = {
            nome: playerName,
            posicao: posicao,
            time_id: selectedTeamId,
        };

        try {
            await axios.post('http://localhost:8080/jogador', playerData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            closeModal(); 
            await fetchPlayers();
        } catch (error) {
            console.error('Erro ao enviar dados do jogador:', error);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    useEffect(() => {
        if (teams.length > 0) {
            fetchPlayers();
        }
    }, [teams]);

    const openModal = (teamId) => {
        setSelectedTeamId(teamId);
        setModalIsOpen(true);
        setIdTime(teamId); 
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setPlayerName('');
        setSelectedTeamId(null);
        setIdTime(''); 
    };

    return (
        <div>
            <h1>Times</h1>
            {teams.map(team => (
                <div key={team.id}>
                    <h2>{team.nome}</h2>
                    <button onClick={() => openModal(team.id)}>Add Jogador</button>
                </div>
            ))}
            <h1>Jogadores</h1>
            {players.map((playerList, index) => (
                <div key={index}>
                    <h2>Jogadores do Time {teams[index]?.nome}</h2>
                    <ul>
                        {playerList.map(player => (
                            <li key={player.id}>{player.nome}</li>
                        ))}
                    </ul>
                </div>
            ))}
            
           
            <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
                <h2>Adicionar Jogador</h2>
                <form onSubmit={enviarDadosProBack}>
                    <label>
                        Nome do Jogador:
                        <input 
                            type="text" 
                            value={playerName} 
                            onChange={(e) => setPlayerName(e.target.value)} 
                            required 
                        />
                    </label>
                    <label>
                        Posicao:
                        <input 
                            type="text" 
                            value={posicao} 
                            onChange={(e) => setPosicao(e.target.value)} 
                            required 
                        />
                    </label>
                    <label>
                        Time:
                        <input 
                            type="number" 
                            value={idTime} 
                            onChange={(e) => setIdTime(e.target.value)} 
                            required 
                            disabled 
                        />
                    </label>
                    <br />
                    <button type="submit">Enviar</button>
                    <button type="button" onClick={closeModal}>Cancelar</button>
                </form>
            </Modal>
        </div>
    );
}

export default Home;
