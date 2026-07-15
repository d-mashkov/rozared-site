<?php
// Приём заявок с форм rozared.com → письмо на pd@rozared.com.
// Письмо доставляется локально (ящик на этом же сервере), внешние сервисы не используются.
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false]);
  exit;
}

// Honeypot: боты заполняют скрытое поле — отвечаем «успехом», письмо не шлём
if (!empty($_POST['_gotcha'])) {
  echo json_encode(['success' => true]);
  exit;
}

$allowed = ['name', 'email', 'phone', 'message', 'mix_name', 'author_name', 'notes', 'mix_recipe'];
$labels  = [
  'name' => 'Name', 'email' => 'Email / WeChat', 'phone' => 'Phone', 'message' => 'Message',
  'mix_name' => 'Mix name', 'author_name' => 'Author', 'notes' => 'Notes', 'mix_recipe' => 'Recipe',
];

$data = [];
foreach ($allowed as $f) {
  if (isset($_POST[$f]) && trim((string)$_POST[$f]) !== '') {
    $data[$f] = trim(str_replace(["\r", "\n"], ' ', (string)$_POST[$f]));
  }
}
if (isset($data['message'])) $data['message'] = trim((string)$_POST['message']); // в теле переносы разрешены
if (isset($data['notes']))   $data['notes']   = trim((string)$_POST['notes']);

if (!$data || mb_strlen(implode('', $data)) > 10000) {
  echo json_encode(['success' => false]);
  exit;
}

$subject = isset($_POST['_subject']) && trim((string)$_POST['_subject']) !== ''
  ? trim(str_replace(["\r", "\n"], ' ', (string)$_POST['_subject']))
  : 'New inquiry from rozared.com';

$lines = [];
foreach ($data as $k => $v) $lines[] = ($labels[$k] ?? $k) . ': ' . $v;
$body = implode("\n", $lines) . "\n\n— rozared.com · " . gmdate('Y-m-d H:i') . " UTC";

$headers = "From: RozaRed Website <noreply@rozared.com>\r\n";
if (!empty($data['email']) && filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
  $headers .= "Reply-To: {$data['email']}\r\n";
}
$headers .= "Content-Type: text/plain; charset=utf-8\r\n";

$ok = mail('pd@rozared.com', '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers);
echo json_encode(['success' => (bool)$ok]);
