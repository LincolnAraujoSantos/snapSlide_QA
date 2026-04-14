const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');

const GAS_URL = 'https://script.google.com/macros/s/AKfycbzaOszSR3WDZLNM2DvsiEOBoXjT8djqY6M3UgMTyLJI6MPLZ-Kb5RB6sgzMjTkcqJRmgA/exec';

// Função para mostrar toast
function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.style.display = 'block';
    toast.style.opacity = 1;

    setTimeout(() => {
        toast.style.transition = "opacity 0.5s ease";
        toast.style.opacity = 0;
        setTimeout(() => {
            toast.style.display = 'none';
            toast.style.transition = "";
        }, 500);
    }, duration);
}

// === PASTE DA IMAGEM ===
document.addEventListener('paste', (event) => {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file') {
            const blob = items[i].getAsFile();
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    document.getElementById('placeholder-text').style.display = 'none';
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(blob);
        }
    }
});

// === ENVIO DE DADOS ===
document.getElementById('btn-send').onclick = async () => {
    const presId = document.getElementById('pres-id').value.trim();
    const pageType = document.getElementById('page-type').value.trim();
    const category = document.getElementById('error-cat').value;
    const description = document.getElementById('error-desc').value.trim();

    if (!presId || canvas.width === 0) {
        alert("Cole uma imagem e preencha o ID da apresentação!");
        return;
    }

    const payload = {
        presentationId: presId,
        pageType: pageType || "N/A",
        category: category || "N/A",
        description: description || "Sem descrição",
        image: canvas.toDataURL('image/png')
    };

    showToast("Calma aee, estou enviando!", 3000);

    const btn = document.getElementById('btn-send');
    btn.disabled = true;
    btn.innerText = "ENVIANDO...";

    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        console.log("RESPOSTA:", text);

        if (text.trim() === "OK") {
            // NOVO COMPORTAMENTO
            showToast("Pronto enviei! Vlw", 2000);
            document.getElementById('error-desc').value = "";

            // Fecha a extensão após o toast
            setTimeout(() => {
                window.close();
            }, 2200);

        } else {
            showToast("Erro no envio: " + text, 4000);
        }
    } catch (error) {
        console.error(error);
        showToast("Erro ao enviar os dados.", 4000);
    } finally {
        btn.disabled = false;
        btn.innerText = "ENVIAR";
    }
};

// === RECUPERAR ID SALVO ===
window.onload = () => {
    chrome.storage.local.get(['lastId'], (data) => {
        if (data.lastId) document.getElementById('pres-id').value = data.lastId;
    });
};

// === zuera ===

function createPopup(message, buttons = []) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.5)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 9999;

    const popup = document.createElement('div');
    popup.style.background = '#111';
    popup.style.color = '#fff';
    popup.style.padding = '20px';
    popup.style.borderRadius = '8px';
    popup.style.minWidth = '300px';
    popup.style.textAlign = 'center';
    popup.innerHTML = `<p style="margin-bottom: 20px;">${message}</p>`;

    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.innerText = btn.text;
        button.style.margin = '0 5px';
        button.style.padding = '8px 12px';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        button.style.background = '#00AFFF';
        button.style.color = '#000';
        button.onclick = () => {
            document.body.removeChild(overlay);
            if (btn.callback) btn.callback();
        };
        popup.appendChild(button);
    });

    overlay.appendChild(popup);
    document.body.appendChild(overlay);
}

// Easter Egg disparando ao digitar
const descField = document.getElementById('error-desc');
let easterEggTriggered = false;

descField.addEventListener('input', () => {
    const value = descField.value.trim().toLowerCase();

    if (!easterEggTriggered && value === "e o gaber?") {
        easterEggTriggered = true;

        createPopup("O GABER é irmão neh!", [
            { text: "Fechar", callback: () => {
                createPopup("E o LINCÃO?", [
                    { text: "Que que tem?", callback: () => {
                        createPopup("Ta ouvindo 2pac", [{ text: "Fechar" }]);
                    }},
                    { text: "Foda-se", callback: () => {
                        createPopup("É isso!", [{ text: "Fechar" }]);
                    }}
                ]);
            }}
        ]);
    }
});