// Função de delay em milissegundos
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Função para buscar e exibir os grupos
const fetchGids = async () => {
    try {
        const res = await fetch("/get-groups");
        let data = (await res.text()).split("\n").map(e => e.trim());

        data = data
            .filter(e => e.length > 0)
            .map(e => {
                let split = e.split(":");
                const id = split.pop();
                const name = split.join(":");

                return `<div class="group-container"><b>${name}</b><br /><code>${id}</code></div>`;
            });

        const container = document.getElementById("gids");
        container.innerHTML = data.join("");  // Exibe todos os grupos
    } catch (error) {
        console.error("Erro ao buscar os grupos: ", error);
    }
};

// Função para ler o arquivo .txt e enviar mensagens
const sendForm = async () => {
    const form = document.querySelector("form");

    let spf_msg = form.elements["spf_msg"].value;
    let rpl_msg = form.elements["rpl_msg"].value;
    let delaySeconds = parseInt(form.elements["delay"].value);  // Captura o delay em segundos

    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("Por favor, selecione um arquivo com os números.");
        return;
    }

    // Ler o arquivo de números
    const reader = new FileReader();
    reader.onload = async function(event) {
        const content = event.target.result;
        const numbers = content.split("\n").map(line => line.trim()).filter(line => line.length > 0);

        // Verifica se todos os campos estão preenchidos
        if (spf_msg.length === 0 || rpl_msg.length === 0) {
            alert("Os campos de mensagem são obrigatórios.");
            return;
        }

        // Converte o delay para milissegundos
        const delayMs = delaySeconds * 1000;

        // Loop para enviar a mensagem para cada número
        for (let i = 0; i < numbers.length; i++) {
            let cid = numbers[i];  // Captura o número (JID)
            if (!cid.includes("@")) cid += "@s.whatsapp.net";

            console.log(`Enviando mensagem para ${cid} com delay de ${delaySeconds} segundos`);

            let data = {
                "chat_id": cid,
                "spoofed_id": cid,  // Suponho que o spoofed_id é o próprio cid
                "message_id": "!",  // Placeholder para o message_id
                "spoofed_message": spf_msg,
                "reply_message": rpl_msg
            };

            // Função que faz o envio da mensagem
            const sendMessage = async () => {
                try {
                    const res = await fetch("/send-spoofed", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(data)
                    });

                    if (!res.ok) {
                        throw new Error("Falha ao enviar a mensagem.");
                    }

                    const text = await res.json();
                    console.log(`Mensagem enviada para ${cid}: ${text.message}`);
                    alert(`Mensagem enviada para ${cid}`);
                } catch (error) {
                    console.error(`Erro ao enviar a mensagem para ${cid}:`, error);
                    alert(`Erro ao enviar a mensagem para ${cid}`);
                }
            };

            // Aplica o delay e envia a mensagem
            await delay(delayMs);  // Aplica o delay antes de enviar para o próximo número
            await sendMessage();
        }

        alert("Todas as mensagens foram enviadas com sucesso!");
    };

    reader.readAsText(file);
};

// Executa a função de busca dos grupos ao carregar a página
fetchGids();
