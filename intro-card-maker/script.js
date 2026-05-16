const state = {
  photoSrc: "",
  template: "simple",
  name: "",
  title: "",
  message: "",
  hobby: "",
  contact: "",
};

const inputs = {
  photo: document.querySelector("#photo-input"),
  name: document.querySelector("#name-input"),
  title: document.querySelector("#title-input"),
  message: document.querySelector("#message-input"),
  hobby: document.querySelector("#hobby-input"),
  contact: document.querySelector("#contact-input"),
  templates: document.querySelectorAll('input[name="template"]'),
};

const preview = {
  card: document.querySelector("#profile-card"),
  photo: document.querySelector("#card-photo"),
  placeholder: document.querySelector("#photo-placeholder"),
  name: document.querySelector("#card-name"),
  title: document.querySelector("#card-title"),
  message: document.querySelector("#card-message"),
  hobby: document.querySelector("#card-hobby"),
  contact: document.querySelector("#card-contact"),
  download: document.querySelector("#download-button"),
};

const templateStyles = {
  simple: {
    background: "#f8fafc",
    text: "#192132",
    muted: "#4f5b6f",
    accent: "#2b70bf",
    title: "#192132",
    imageShape: "circle",
  },
  cute: {
    background: "#fff7fb",
    text: "#451a35",
    muted: "#67324f",
    accent: "#be185d",
    title: "#9d174d",
    imageShape: "circle",
  },
  fresh: {
    background: "#f7fbf8",
    text: "#12302b",
    muted: "#48645f",
    accent: "#2e7d71",
    title: "#1f6158",
    imageShape: "soft",
  },
};

function textOrFallback(value, fallback) {
  return value.trim() || fallback;
}

function updatePreview() {
  preview.card.className = `profile-card theme-${state.template}`;
  preview.name.textContent = textOrFallback(state.name, "あなたの名前");
  preview.title.textContent = textOrFallback(state.title, "肩書き");
  preview.message.textContent = textOrFallback(state.message, "ひとことを入力してください。");
  preview.hobby.textContent = textOrFallback(state.hobby, "趣味");
  preview.contact.textContent = textOrFallback(state.contact, "SNS / 連絡先");

  if (state.photoSrc) {
    preview.photo.src = state.photoSrc;
    preview.photo.hidden = false;
    preview.placeholder.hidden = true;
  } else {
    preview.photo.removeAttribute("src");
    preview.photo.hidden = true;
    preview.placeholder.hidden = false;
  }
}

function bindTextInput(input, key) {
  input.addEventListener("input", () => {
    state[key] = input.value;
    updatePreview();
  });
}

inputs.photo.addEventListener("change", () => {
  const file = inputs.photo.files?.[0];
  if (!file) {
    state.photoSrc = "";
    updatePreview();
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    state.photoSrc = String(reader.result || "");
    updatePreview();
  });
  reader.readAsDataURL(file);
});

bindTextInput(inputs.name, "name");
bindTextInput(inputs.title, "title");
bindTextInput(inputs.message, "message");
bindTextInput(inputs.hobby, "hobby");
bindTextInput(inputs.contact, "contact");

inputs.templates.forEach((input) => {
  input.addEventListener("change", () => {
    state.template = input.value;
    updatePreview();
  });
});

preview.download.addEventListener("click", async () => {
  preview.download.disabled = true;
  preview.download.textContent = "作成中";

  try {
    const blob = await createCardPng();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filenameSafe(textOrFallback(state.name, "profile"))}-card.png`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } finally {
    preview.download.disabled = false;
    preview.download.textContent = "PNG保存";
  }
});

async function createCardPng() {
  const width = 1080;
  const height = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const style = templateStyles[state.template];

  drawCardBackground(ctx, width, height, style, state.template);
  await drawPhoto(ctx, style);
  drawTextContent(ctx, style);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("PNG画像を作成できませんでした。"));
        return;
      }
      resolve(blob);
    }, "image/png", 1);
  });
}

function drawCardBackground(ctx, width, height, style, template) {
  ctx.fillStyle = style.background;
  ctx.fillRect(0, 0, width, height);

  if (template === "simple") {
    ctx.fillStyle = "#17202f";
    ctx.fillRect(0, 0, 26, height);
    const gradient = ctx.createLinearGradient(width, 0, 160, 700);
    gradient.addColorStop(0, "rgba(43, 112, 191, 0.16)");
    gradient.addColorStop(1, "rgba(43, 112, 191, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    return;
  }

  if (template === "cute") {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "rgba(255, 130, 178, 0.2)");
    gradient.addColorStop(1, "rgba(139, 92, 246, 0.13)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    drawCircle(ctx, 170, 210, 94, "rgba(255, 130, 178, 0.28)");
    drawCircle(ctx, 900, 170, 84, "rgba(255, 198, 92, 0.34)");
    return;
  }

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "rgba(46, 125, 113, 0.2)");
  gradient.addColorStop(0.48, "rgba(46, 125, 113, 0)");
  gradient.addColorStop(1, "rgba(234, 179, 8, 0.2)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

async function drawPhoto(ctx, style) {
  const x = 92;
  const y = 92;
  const size = 320;

  if (state.template === "fresh") {
    ctx.beginPath();
    roundRect(ctx, x + 34, y + 34, size, size, 54);
    ctx.fillStyle = "rgba(46, 125, 113, 0.16)";
    ctx.fill();
  }

  if (state.template === "cute") {
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate((-2 * Math.PI) / 180);
    ctx.translate(-(x + size / 2), -(y + size / 2));
  }

  createPhotoClip(ctx, x, y, size, style.imageShape);

  if (state.photoSrc) {
    const image = await loadImage(state.photoSrc);
    drawCoverImage(ctx, image, x, y, size, size);
  } else {
    ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = "rgba(23, 32, 47, 0.48)";
    ctx.font = "700 42px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("PHOTO", x + size / 2, y + size / 2);
  }

  ctx.restore();

  if (state.template === "cute") {
    ctx.restore();
  }

  if (state.template === "simple") {
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#17202f";
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2 - 4, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function createPhotoClip(ctx, x, y, size, shape) {
  ctx.save();
  ctx.beginPath();
  if (shape === "circle") {
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  } else {
    roundRect(ctx, x, y, size, size, shape === "rounded" ? 74 : 54);
  }
  ctx.clip();
}

function drawTextContent(ctx, style) {
  const left = 92;
  const maxWidth = 896;
  const name = textOrFallback(state.name, "あなたの名前");
  const title = textOrFallback(state.title, "肩書き");
  const message = textOrFallback(state.message, "ひとことを入力してください。");
  const hobby = textOrFallback(state.hobby, "趣味");
  const contact = textOrFallback(state.contact, "SNS / 連絡先");

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = style.accent;
  ctx.font = "800 34px sans-serif";
  ctx.fillText("Hello, I am", left, 565);

  ctx.fillStyle = style.text;
  ctx.font = "900 90px sans-serif";
  const nameLines = fitLines(ctx, name, maxWidth, 2);
  nameLines.forEach((line, index) => {
    ctx.fillText(line, left, 665 + index * 96);
  });

  const titleY = 704 + nameLines.length * 96;
  ctx.fillStyle = style.title;
  ctx.font = "800 40px sans-serif";
  wrapText(ctx, title, left, titleY, maxWidth, 50, 2);

  ctx.fillStyle = style.muted;
  ctx.font = "500 37px sans-serif";
  wrapText(ctx, message, left, titleY + 108, maxWidth, 58, 4);

  const detailsY = 1162;
  drawDetail(ctx, "Hobby", hobby, left, detailsY, style);
  drawDetail(ctx, "Contact", contact, left, detailsY + 92, style);
}

function drawDetail(ctx, label, value, x, y, style) {
  ctx.fillStyle = style.accent;
  ctx.font = "900 25px sans-serif";
  ctx.fillText(label, x, y);
  ctx.fillStyle = style.text;
  ctx.font = "800 31px sans-serif";
  wrapText(ctx, value, x, y + 42, 896, 38, 1);
}

function fitLines(ctx, text, maxWidth, maxLines) {
  const lines = [];
  const chars = Array.from(text);
  let current = "";

  chars.forEach((char) => {
    const next = `${current}${char}`;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = char;
      return;
    }
    current = next;
  });

  if (current) {
    lines.push(current);
  }

  if (lines.length <= maxLines) {
    return lines;
  }

  const clipped = lines.slice(0, maxLines);
  let last = clipped[clipped.length - 1];
  while (ctx.measureText(`${last}...`).width > maxWidth && last.length > 0) {
    last = last.slice(0, -1);
  }
  clipped[clipped.length - 1] = `${last}...`;
  return clipped;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  fitLines(ctx, text, maxWidth, maxLines).forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });
}

function drawCoverImage(ctx, image, x, y, width, height) {
  const imageRatio = image.width / image.height;
  const frameRatio = width / height;
  let sourceWidth = image.width;
  let sourceHeight = image.height;
  let sourceX = 0;
  let sourceY = 0;

  if (imageRatio > frameRatio) {
    sourceWidth = image.height * frameRatio;
    sourceX = (image.width - sourceWidth) / 2;
  } else {
    sourceHeight = image.width / frameRatio;
    sourceY = (image.height - sourceHeight) / 2;
  }

  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawCircle(ctx, x, y, radius, color) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function filenameSafe(value) {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 40);
}

updatePreview();
