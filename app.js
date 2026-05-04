const SUPABASE_URL = "https://wgicssoszlthhzsnkcys.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnaWNzc29zemx0aGh6c25rY3lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4OTYyMzYsImV4cCI6MjA5MzQ3MjIzNn0.7Z4ak9BEU4YoQCL6ic967lVKgr9cb8EZArLasrhVan4";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let username = "";
let channel = "general";

function enter() {
  username = document.getElementById("username").value.trim();
  if (!username) return alert("Pseudo requis");

  document.getElementById("login").style.display = "none";
  document.getElementById("app").style.display = "block";

  loadMessages();
  listen();
}

function changeChannel() {
  channel = document.getElementById("channel").value;
  document.getElementById("title").innerText = "#" + channel;
  loadMessages();
}

async function loadMessages() {
  const { data } = await client
    .from("messages")
    .select("*")
    .eq("channel", channel)
    .order("created_at", { ascending: true });

  const chat = document.getElementById("chat");
  chat.innerHTML = "";

  data.forEach(m => {
    chat.innerHTML += `<div><b>${m.username}</b>: ${m.content}</div>`;
  });

  chat.scrollTop = chat.scrollHeight;
}

async function send() {
  const input = document.getElementById("msg");
  if (!input.value.trim()) return;

  await client.from("messages").insert({
    username,
    channel,
    content: input.value
  });

  input.value = "";
}

function listen() {
  client
    .channel("chat")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      payload => {
        if (payload.new.channel === channel) {
          const chat = document.getElementById("chat");
          chat.innerHTML += `<div><b>${payload.new.username}</b>: ${payload.new.content}</div>`;
          chat.scrollTop = chat.scrollHeight;
        }
      }
    )
    .subscribe();
}
