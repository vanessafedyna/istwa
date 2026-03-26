export function generateHeroQuoteImage(hero, language) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context || !hero) {
        return;
    }

    const quote = getLocalizedHeroValue(hero.quote, language);
    const heroName = getLocalizedHeroValue(hero.name, language);
    const heroRole = getLocalizedHeroValue(hero.role, language);
    const appSubtitle = getAppSubtitle(language);

    canvas.width = 1080;
    canvas.height = 1080;

    context.fillStyle = hero.color || "#103a5d";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "rgba(0, 0, 0, 0.3)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = "bold 200px serif";
    context.fillStyle = "rgba(255, 255, 255, 0.15)";
    context.textAlign = "left";
    context.textBaseline = "alphabetic";
    context.fillText("«", 60, 250);

    context.font = "bold 36px sans-serif";
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.textBaseline = "middle";

    const quoteLines = wrapText(context, quote, 780);
    const quoteLineHeight = 52;
    const quoteBlockHeight = quoteLines.length * quoteLineHeight;
    const quoteStartY = 400 - ((quoteBlockHeight - quoteLineHeight) / 2);

    quoteLines.forEach((line, index) => {
        context.fillText(line, canvas.width / 2, quoteStartY + (index * quoteLineHeight));
    });

    const nameY = quoteStartY + quoteBlockHeight + 70;
    const roleY = nameY + 48;

    context.font = "bold 28px sans-serif";
    context.fillStyle = "rgba(255, 255, 255, 0.9)";
    context.fillText(heroName, canvas.width / 2, nameY);

    context.font = "22px sans-serif";
    context.fillStyle = "rgba(255, 255, 255, 0.7)";
    context.fillText(heroRole, canvas.width / 2, roleY);

    context.strokeStyle = "rgba(255, 255, 255, 0.3)";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo((canvas.width - 200) / 2, 950);
    context.lineTo((canvas.width + 200) / 2, 950);
    context.stroke();

    context.font = "bold 24px sans-serif";
    context.fillStyle = "#ffffff";
    context.fillText("ISTWA", canvas.width / 2, 990);

    context.font = "16px sans-serif";
    context.fillStyle = "rgba(255, 255, 255, 0.6)";
    context.fillText(appSubtitle, canvas.width / 2, 1020);

    canvas.toBlob((blob) => {
        if (!blob) {
            return;
        }

        const downloadUrl = window.URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");

        downloadLink.href = downloadUrl;
        downloadLink.download = `istwa-${hero.id}.png`;
        downloadLink.click();

        window.setTimeout(() => {
            window.URL.revokeObjectURL(downloadUrl);
        }, 0);
    }, "image/png");
}

function wrapText(context, text, maxWidth) {
    const words = String(text || "").trim().split(/\s+/).filter(Boolean);
    const lines = [];
    let currentLine = "";

    if (words.length === 0) {
        return [""];
    }

    words.forEach((word) => {
        const testLine = currentLine === "" ? word : `${currentLine} ${word}`;

        if (context.measureText(testLine).width <= maxWidth) {
            currentLine = testLine;
            return;
        }

        if (currentLine !== "") {
            lines.push(currentLine);
        }

        currentLine = word;
    });

    if (currentLine !== "") {
        lines.push(currentLine);
    }

    return lines;
}

function getLocalizedHeroValue(value, language) {
    if (value && typeof value === "object") {
        return String(value[language] || value.fr || value.ht || value.en || "");
    }

    return String(value || "");
}

function getAppSubtitle(language) {
    if (language === "ht") {
        return "Istwa Ayiti";
    }

    if (language === "en") {
        return "History of Haiti";
    }

    return "Histoire d'Haïti";
}
