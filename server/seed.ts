import { storage } from "./storage";

export async function seedDatabase() {
  const count = await storage.getLessonsCount();
  if (count > 0) {
    console.log("База данных уже заполнена, пропускаем сид.");
    return;
  }

  console.log("Заполняем базу данных начальными данными...");

  // ──────────────────────────────────────────────
  // Урок 1: Привет, Python!
  // ──────────────────────────────────────────────
  const lesson1 = await storage.createLesson({
    slug: "hello-python",
    title: "Привет, Python!",
    description: "Узнай, что такое Python, и напиши свою первую программу.",
    order: 1,
    category: "Основы",
  });

  await storage.createStep({
    lessonId: lesson1.id,
    order: 1,
    type: "theory",
    title: "Что такое Python?",
    content: JSON.stringify({
      html: `
<h2>Что такое Python?</h2>
<p>Python — это язык программирования. Он позволяет «разговаривать» с компьютером и давать ему задания.</p>
<p>Ты уже знаешь Scratch — там задания выглядят как цветные блоки, которые можно соединять. Python — это то же самое, только вместо блоков ты пишешь текст!</p>
<div class="comparison">
  <div class="scratch-block">📦 Scratch: <code>[сказать "Привет, мир!"]</code></div>
  <div class="python-block">🐍 Python: <code>print("Привет, мир!")</code></div>
</div>
<h3>Почему Python?</h3>
<ul>
  <li>🌍 Python используется везде: в играх, науке, веб-сайтах, искусственном интеллекте</li>
  <li>📖 Он читается почти как обычный текст на английском</li>
  <li>🚀 Его используют в Google, NASA, Instagram и YouTube</li>
</ul>
<h3>Как работает print()?</h3>
<p>Функция <code>print()</code> показывает текст на экране. Текст нужно заключить в кавычки:</p>
<pre><code>print("Привет!")</code></pre>
<p>Скобки <code>()</code> — это как «рот» функции. Туда кладём то, что хотим показать.</p>
      `,
    }),
    hint: null,
    solution: null,
  });

  await storage.createStep({
    lessonId: lesson1.id,
    order: 2,
    type: "coding",
    title: "Твоя первая программа",
    content: JSON.stringify({
      description: `Напиши программу, которая выводит на экран фразу: **Привет, мир!**

Используй функцию \`print()\` и не забудь про кавычки вокруг текста.`,
      starterCode: `# Напиши свою первую программу Python ниже:
`,
      checkType: "output_contains",
      expectedOutput: "Привет, мир!",
    }),
    hint: 'Используй print() с текстом в кавычках: print("Привет, мир!")',
    solution: `print("Привет, мир!")`,
  });

  await storage.createStep({
    lessonId: lesson1.id,
    order: 3,
    type: "coding",
    title: "Используй переменную",
    content: JSON.stringify({
      description: `Создай переменную \`name\` со своим именем и выведи приветствие.

Переменная — это как «коробочка» с именем, в которую можно положить данные.

**Что нужно сделать:**
1. Создай переменную: \`name = "Алекс"\`
2. Выведи приветствие используя f-строку: \`print(f"Привет, {name}!")\`

f-строки — это удобный способ вставить переменную прямо в текст!`,
      starterCode: `# Создай переменную с именем
name = "Алекс"

# Выведи приветствие с f-строкой
`,
      checkType: "output_contains",
      expectedOutput: "Привет,",
    }),
    hint: 'Используй f-строку: print(f"Привет, {name}!") — фигурные скобки вставляют значение переменной.',
    solution: `name = "Алекс"
print(f"Привет, {name}!")`,
  });

  // ──────────────────────────────────────────────
  // Урок 2: Переменные и типы данных
  // ──────────────────────────────────────────────
  const lesson2 = await storage.createLesson({
    slug: "variables-types",
    title: "Переменные и типы данных",
    description: "Узнай про числа, текст и булевы значения в Python.",
    order: 2,
    category: "Основы",
  });

  await storage.createStep({
    lessonId: lesson2.id,
    order: 1,
    type: "theory",
    title: "Типы данных в Python",
    content: JSON.stringify({
      html: `
<h2>Типы данных</h2>
<p>Python умеет работать с разными видами данных. Каждый вид называется <strong>типом</strong>.</p>
<table>
  <thead><tr><th>Тип</th><th>Название</th><th>Пример</th></tr></thead>
  <tbody>
    <tr><td><code>int</code></td><td>Целое число</td><td><code>42</code>, <code>-7</code>, <code>100</code></td></tr>
    <tr><td><code>float</code></td><td>Дробное число</td><td><code>3.14</code>, <code>2.5</code></td></tr>
    <tr><td><code>str</code></td><td>Строка (текст)</td><td><code>"Привет"</code>, <code>"Python"</code></td></tr>
    <tr><td><code>bool</code></td><td>Булево значение</td><td><code>True</code>, <code>False</code></td></tr>
  </tbody>
</table>
<h3>Переменные</h3>
<p>Переменная — это «ящик» с именем. Ты кладёшь в него данные и можешь использовать их позже:</p>
<pre><code>возраст = 14
рост = 1.75
имя = "Саша"
любит_python = True</code></pre>
<h3>Как узнать тип?</h3>
<p>Используй функцию <code>type()</code>:</p>
<pre><code>print(type(42))       # &lt;class 'int'&gt;
print(type(3.14))     # &lt;class 'float'&gt;
print(type("текст"))  # &lt;class 'str'&gt;
print(type(True))     # &lt;class 'bool'&gt;</code></pre>
      `,
    }),
    hint: null,
    solution: null,
  });

  await storage.createStep({
    lessonId: lesson2.id,
    order: 2,
    type: "coding",
    title: "Создай переменные разных типов",
    content: JSON.stringify({
      description: `Создай четыре переменные разных типов и выведи их значения:

1. Целое число — твой возраст
2. Дробное число — твой рост (например, 1.70)
3. Строка — твоё имя
4. Булево значение — нравится ли тебе Python (True или False)

Используй \`print()\` для каждой переменной.`,
      starterCode: `# Создай переменные
vozrast = 14
rost = 1.70
imya = "Маша"
lyubit_python = True

# Выведи все переменные
`,
      checkType: "runs_successfully",
    }),
    hint: "Используй print() для каждой переменной отдельно. Например: print(vozrast)",
    solution: `vozrast = 14
rost = 1.70
imya = "Маша"
lyubit_python = True
print(vozrast)
print(rost)
print(imya)
print(lyubit_python)`,
  });

  await storage.createStep({
    lessonId: lesson2.id,
    order: 3,
    type: "quiz",
    title: "Проверь знания: типы данных",
    content: JSON.stringify({
      question: "Какой тип у значения 3.14?",
      options: ["int", "float", "str", "bool"],
      correct: 1,
      explanation: "3.14 — это дробное число, поэтому его тип float (от слова \"floating point\" — число с плавающей точкой).",
    }),
    hint: null,
    solution: null,
  });

  await storage.createStep({
    lessonId: lesson2.id,
    order: 4,
    type: "coding",
    title: "Простой калькулятор",
    content: JSON.stringify({
      description: `Создай два числа и выведи результат их сложения.

**Что нужно сделать:**
1. Создай переменную \`a = 15\`
2. Создай переменную \`b = 27\`
3. Создай переменную \`summa = a + b\`
4. Выведи результат: \`print(f"Сумма: {summa}")\`

В Python можно делать арифметику прямо с числами!`,
      starterCode: `# Два числа
a = 15
b = 27

# Вычисли сумму и выведи результат
`,
      checkType: "output_contains",
      expectedOutput: "42",
    }),
    hint: 'Создай summa = a + b, затем print(f"Сумма: {summa}")',
    solution: `a = 15
b = 27
summa = a + b
print(f"Сумма: {summa}")`,
  });

  // ──────────────────────────────────────────────
  // Урок 3: Условия: if, elif, else
  // ──────────────────────────────────────────────
  const lesson3 = await storage.createLesson({
    slug: "conditions",
    title: "Условия: if, elif, else",
    description: "Научи программу принимать решения с помощью условий.",
    order: 3,
    category: "Условия",
  });

  await storage.createStep({
    lessonId: lesson3.id,
    order: 1,
    type: "theory",
    title: "Как работают условия",
    content: JSON.stringify({
      html: `
<h2>Условия в Python</h2>
<p>Условия позволяют программе принимать решения: «Если это правда — делай одно. Если нет — делай другое».</p>
<pre><code>if условие:
    # это выполнится, если условие True
elif другое_условие:
    # это выполнится, если первое False, но это True
else:
    # это выполнится, если все условия False</code></pre>
<h3>Операторы сравнения</h3>
<table>
  <thead><tr><th>Оператор</th><th>Смысл</th><th>Пример</th></tr></thead>
  <tbody>
    <tr><td><code>==</code></td><td>Равно</td><td><code>5 == 5</code> → True</td></tr>
    <tr><td><code>!=</code></td><td>Не равно</td><td><code>5 != 3</code> → True</td></tr>
    <tr><td><code>&gt;</code></td><td>Больше</td><td><code>7 &gt; 3</code> → True</td></tr>
    <tr><td><code>&lt;</code></td><td>Меньше</td><td><code>2 &lt; 10</code> → True</td></tr>
    <tr><td><code>&gt;=</code></td><td>Больше или равно</td><td><code>5 &gt;= 5</code> → True</td></tr>
    <tr><td><code>&lt;=</code></td><td>Меньше или равно</td><td><code>3 &lt;= 8</code> → True</td></tr>
  </tbody>
</table>
<h3>Пример</h3>
<pre><code>temperatura = 25

if temperatura > 30:
    print("Жарко! 🌞")
elif temperatura > 15:
    print("Тепло! 😊")
else:
    print("Холодно! 🧥")</code></pre>
<p><strong>Важно:</strong> отступы (пробелы) перед кодом внутри if — обязательны! Python использует их для структуры.</p>
      `,
    }),
    hint: null,
    solution: null,
  });

  await storage.createStep({
    lessonId: lesson3.id,
    order: 2,
    type: "coding",
    title: "Положительное, отрицательное или ноль",
    content: JSON.stringify({
      description: `Напиши программу, которая определяет, является ли число положительным, отрицательным или нулём.

**Что нужно сделать:**
1. Создай переменную \`число = -5\` (можешь поменять значение)
2. Используй if/elif/else чтобы вывести:
   - "Положительное" если число > 0
   - "Отрицательное" если число < 0  
   - "Ноль" если число == 0`,
      starterCode: `chislo = -5

# Проверь, какое число
`,
      checkType: "runs_successfully",
    }),
    hint: 'Структура: if chislo > 0: ... elif chislo < 0: ... else: ...',
    solution: `chislo = -5

if chislo > 0:
    print("Положительное")
elif chislo < 0:
    print("Отрицательное")
else:
    print("Ноль")`,
  });

  await storage.createStep({
    lessonId: lesson3.id,
    order: 3,
    type: "coding",
    title: "Калькулятор оценок",
    content: JSON.stringify({
      description: `Напиши программу, которая переводит балл (0-100) в оценку.

**Правила:**
- 90-100 → "Отлично"
- 75-89 → "Хорошо"
- 60-74 → "Удовлетворительно"
- Ниже 60 → "Неудовлетворительно"

Попробуй с \`ball = 85\``,
      starterCode: `ball = 85

# Определи оценку по баллу
`,
      checkType: "output_contains",
      expectedOutput: "Хорошо",
    }),
    hint: "Используй elif для каждого диапазона. Начни с наибольшего: if ball >= 90: ...",
    solution: `ball = 85

if ball >= 90:
    print("Отлично")
elif ball >= 75:
    print("Хорошо")
elif ball >= 60:
    print("Удовлетворительно")
else:
    print("Неудовлетворительно")`,
  });

  await storage.createStep({
    lessonId: lesson3.id,
    order: 4,
    type: "quiz",
    title: "Проверь знания: условия",
    content: JSON.stringify({
      question: "Что выведет эта программа?\n\nif 5 > 3:\n    print(\"да\")",
      options: ["нет", "да", "Ошибка", "Ничего не выведет"],
      correct: 1,
      explanation: "5 > 3 — это True, поэтому блок if выполнится и программа напечатает \"да\".",
    }),
    hint: null,
    solution: null,
  });

  // ──────────────────────────────────────────────
  // Урок 4: Циклы: for и while
  // ──────────────────────────────────────────────
  const lesson4 = await storage.createLesson({
    slug: "loops",
    title: "Циклы: for и while",
    description: "Повторяй действия автоматически с помощью циклов.",
    order: 4,
    category: "Циклы",
  });

  await storage.createStep({
    lessonId: lesson4.id,
    order: 1,
    type: "theory",
    title: "Что такое циклы",
    content: JSON.stringify({
      html: `
<h2>Циклы в Python</h2>
<p>Цикл позволяет повторять одни и те же действия много раз. Без цикла тебе пришлось бы писать <code>print()</code> 100 раз подряд!</p>
<h3>Цикл for</h3>
<p>Цикл <code>for</code> перебирает элементы по очереди:</p>
<pre><code>for i in range(5):
    print(i)
# Выведет: 0 1 2 3 4</code></pre>
<p><code>range(n)</code> создаёт числа от 0 до n-1. Можно задавать диапазон:</p>
<pre><code>range(1, 6)   # 1, 2, 3, 4, 5
range(0, 10, 2)  # 0, 2, 4, 6, 8 (с шагом 2)</code></pre>
<h3>Цикл while</h3>
<p>Цикл <code>while</code> повторяется, пока условие правда:</p>
<pre><code>schetchik = 0
while schetchik < 5:
    print(schetchik)
    schetchik += 1
# Выведет: 0 1 2 3 4</code></pre>
<p><strong>Внимание!</strong> Не забудь изменять переменную внутри while, иначе цикл будет бесконечным!</p>
<h3>Цикл по списку</h3>
<pre><code>frukty = ["яблоко", "банан", "вишня"]
for frukt in frukty:
    print(frukt)</code></pre>
      `,
    }),
    hint: null,
    solution: null,
  });

  await storage.createStep({
    lessonId: lesson4.id,
    order: 2,
    type: "coding",
    title: "Числа от 1 до 10",
    content: JSON.stringify({
      description: `Используй цикл \`for\` и \`range()\`, чтобы вывести числа от 1 до 10 (включительно).

Каждое число должно быть на отдельной строке.

**Подсказка:** \`range(1, 11)\` даст числа 1, 2, 3, ..., 10`,
      starterCode: `# Выведи числа от 1 до 10
`,
      checkType: "output_contains",
      expectedOutput: "10",
    }),
    hint: "for i in range(1, 11): print(i)",
    solution: `for i in range(1, 11):
    print(i)`,
  });

  await storage.createStep({
    lessonId: lesson4.id,
    order: 3,
    type: "coding",
    title: "Сумма чисел через while",
    content: JSON.stringify({
      description: `Используй цикл \`while\`, чтобы посчитать сумму чисел от 1 до N.

Пусть \`N = 10\`. Программа должна посчитать 1+2+3+...+10 и вывести результат.

**Что нужно:**
1. Переменная \`summa = 0\`
2. Переменная \`i = 1\`
3. Цикл while пока i <= N
4. Внутри: добавляй i к summa, увеличивай i
5. После цикла: выведи summa`,
      starterCode: `N = 10
summa = 0
i = 1

# Используй while для подсчёта суммы
`,
      checkType: "output_contains",
      expectedOutput: "55",
    }),
    hint: "while i <= N: summa += i и i += 1. После цикла: print(summa)",
    solution: `N = 10
summa = 0
i = 1

while i <= N:
    summa += i
    i += 1

print(summa)`,
  });

  await storage.createStep({
    lessonId: lesson4.id,
    order: 4,
    type: "coding",
    title: "Физз-Базз",
    content: JSON.stringify({
      description: `Классическая задача программирования — ФиззБазз!

Выведи числа от 1 до 20, но:
- Если число делится на 3 → выведи **"Физз"**
- Если число делится на 5 → выведи **"Базз"**
- Если делится и на 3, и на 5 → выведи **"ФиззБазз"**
- Иначе → выведи само число

**Подсказка:** Оператор \`%\` (остаток от деления): \`15 % 3 == 0\` → True`,
      starterCode: `# ФиззБазз от 1 до 20
for i in range(1, 21):
    # Напиши условия здесь
    pass
`,
      checkType: "output_contains",
      expectedOutput: "ФиззБазз",
    }),
    hint: "Проверяй сначала делимость на 15 (3 и 5 вместе), затем на 3, затем на 5, иначе print(i)",
    solution: `for i in range(1, 21):
    if i % 15 == 0:
        print("ФиззБазз")
    elif i % 3 == 0:
        print("Физз")
    elif i % 5 == 0:
        print("Базз")
    else:
        print(i)`,
  });

  // ──────────────────────────────────────────────
  // Урок 5: Функции
  // ──────────────────────────────────────────────
  const lesson5 = await storage.createLesson({
    slug: "functions",
    title: "Функции",
    description: "Создавай свои команды с помощью функций и используй их повторно.",
    order: 5,
    category: "Функции",
  });

  await storage.createStep({
    lessonId: lesson5.id,
    order: 1,
    type: "theory",
    title: "Что такое функции",
    content: JSON.stringify({
      html: `
<h2>Функции в Python</h2>
<p>Функция — это как кнопка: один раз создал, нажимаешь сколько угодно раз!</p>
<h3>Создание функции (def)</h3>
<pre><code>def privetstvie():
    print("Привет! Как дела?")

# Вызов функции
privetstvie()   # Привет! Как дела?
privetstvie()   # Привет! Как дела?</code></pre>
<h3>Параметры</h3>
<p>Функции могут принимать данные — это называется параметрами:</p>
<pre><code>def privetstvie(imya):
    print(f"Привет, {imya}!")

privetstvie("Маша")  # Привет, Маша!
privetstvie("Петя")  # Привет, Петя!</code></pre>
<h3>Возвращаемое значение (return)</h3>
<p>Функция может вычислить что-то и <strong>вернуть</strong> результат:</p>
<pre><code>def kvadrat(chislo):
    return chislo * chislo

rezultat = kvadrat(5)
print(rezultat)  # 25</code></pre>
<p><code>return</code> — это как ответ функции. Без <code>return</code> функция возвращает <code>None</code>.</p>
<h3>Несколько параметров</h3>
<pre><code>def slozhi(a, b):
    return a + b

print(slozhi(3, 7))  # 10</code></pre>
      `,
    }),
    hint: null,
    solution: null,
  });

  await storage.createStep({
    lessonId: lesson5.id,
    order: 2,
    type: "coding",
    title: "Функция квадрата числа",
    content: JSON.stringify({
      description: `Напиши функцию \`kvadrat(n)\`, которая **возвращает** квадрат числа (n²).

**Что нужно:**
1. Создай функцию def kvadrat(n)
2. Используй return чтобы вернуть n * n
3. Проверь: \`print(kvadrat(4))\` должно вывести 16
4. Проверь: \`print(kvadrat(7))\` должно вывести 49`,
      starterCode: `# Напиши функцию kvadrat
def kvadrat(n):
    # Твой код здесь
    pass

# Проверка
print(kvadrat(4))
print(kvadrat(7))
`,
      checkType: "output_contains",
      expectedOutput: "16",
    }),
    hint: "Внутри функции напиши: return n * n",
    solution: `def kvadrat(n):
    return n * n

print(kvadrat(4))
print(kvadrat(7))`,
  });

  await storage.createStep({
    lessonId: lesson5.id,
    order: 3,
    type: "coding",
    title: "Функция is_even",
    content: JSON.stringify({
      description: `Напиши функцию \`is_even(n)\`, которая возвращает \`True\` если число чётное, и \`False\` если нечётное.

**Подсказка:** Число чётное если остаток от деления на 2 равен 0: \`n % 2 == 0\`

**Проверь:**
- \`print(is_even(4))\` → True
- \`print(is_even(7))\` → False`,
      starterCode: `# Напиши функцию is_even
def is_even(n):
    # Твой код здесь
    pass

# Проверка
print(is_even(4))
print(is_even(7))
`,
      checkType: "output_contains",
      expectedOutput: "True",
    }),
    hint: "return n % 2 == 0 — это выражение само по себе возвращает True или False",
    solution: `def is_even(n):
    return n % 2 == 0

print(is_even(4))
print(is_even(7))`,
  });

  await storage.createStep({
    lessonId: lesson5.id,
    order: 4,
    type: "quiz",
    title: "Проверь знания: функции",
    content: JSON.stringify({
      question: "Что делает ключевое слово return в функции?",
      options: [
        "Останавливает программу",
        "Возвращает значение из функции обратно туда, где её вызвали",
        "Выводит значение на экран",
        "Создаёт новую переменную",
      ],
      correct: 1,
      explanation: "return завершает функцию и отдаёт значение туда, откуда функцию вызвали. Это отличается от print() — print только показывает на экране, но значение нельзя использовать дальше.",
    }),
    hint: null,
    solution: null,
  });

  // ──────────────────────────────────────────────
  // Урок 6: Списки
  // ──────────────────────────────────────────────
  const lesson6 = await storage.createLesson({
    slug: "lists",
    title: "Списки",
    description: "Храни много значений в одной переменной с помощью списков.",
    order: 6,
    category: "Списки",
  });

  await storage.createStep({
    lessonId: lesson6.id,
    order: 1,
    type: "theory",
    title: "Что такое списки",
    content: JSON.stringify({
      html: `
<h2>Списки в Python</h2>
<p>Список — это как полка с ящиками. Каждый ящик имеет номер (индекс) и хранит данные.</p>
<h3>Создание списка</h3>
<pre><code>frukty = ["яблоко", "банан", "вишня"]
chisla = [1, 2, 3, 4, 5]
smeshanniy = [42, "Python", True, 3.14]</code></pre>
<h3>Индексы (нумерация с нуля!)</h3>
<pre><code>frukty = ["яблоко", "банан", "вишня"]
print(frukty[0])   # яблоко  (первый элемент — индекс 0!)
print(frukty[1])   # банан
print(frukty[2])   # вишня
print(frukty[-1])  # вишня  (последний — с конца)</code></pre>
<h3>Методы списков</h3>
<table>
  <thead><tr><th>Метод</th><th>Что делает</th></tr></thead>
  <tbody>
    <tr><td><code>append(x)</code></td><td>Добавить элемент в конец</td></tr>
    <tr><td><code>remove(x)</code></td><td>Удалить элемент</td></tr>
    <tr><td><code>len(список)</code></td><td>Количество элементов</td></tr>
    <tr><td><code>sorted(список)</code></td><td>Отсортированная копия</td></tr>
    <tr><td><code>max(список)</code></td><td>Наибольший элемент</td></tr>
    <tr><td><code>min(список)</code></td><td>Наименьший элемент</td></tr>
  </tbody>
</table>
<h3>Перебор списка</h3>
<pre><code>for frukt in frukty:
    print(frukt)</code></pre>
      `,
    }),
    hint: null,
    solution: null,
  });

  await storage.createStep({
    lessonId: lesson6.id,
    order: 2,
    type: "coding",
    title: "Список фруктов",
    content: JSON.stringify({
      description: `Создай список из 5 фруктов и выведи каждый фрукт с помощью цикла \`for\`.

**Что нужно:**
1. Создай список: \`frukty = ["яблоко", "банан", "апельсин", "груша", "манго"]\`
2. Используй цикл for чтобы вывести каждый фрукт
3. Также выведи общее количество фруктов: \`print(f"Всего фруктов: {len(frukty)}")\``,
      starterCode: `frukty = ["яблоко", "банан", "апельсин", "груша", "манго"]

# Выведи каждый фрукт
`,
      checkType: "output_contains",
      expectedOutput: "яблоко",
    }),
    hint: "for frukt in frukty: print(frukt)",
    solution: `frukty = ["яблоко", "банан", "апельсин", "груша", "манго"]

for frukt in frukty:
    print(frukt)

print(f"Всего фруктов: {len(frukty)}")`,
  });

  await storage.createStep({
    lessonId: lesson6.id,
    order: 3,
    type: "coding",
    title: "Максимум без max()",
    content: JSON.stringify({
      description: `Найди наибольшее число в списке **без использования функции max()**.

**Алгоритм:**
1. Создай переменную \`maksimum = chisla[0]\` (считаем первый элемент максимальным)
2. Перебери все числа в списке
3. Если текущее число больше \`maksimum\` — обнови \`maksimum\`
4. Выведи результат

Список для работы: \`chisla = [3, 17, 5, 42, 8, 99, 1, 56]\``,
      starterCode: `chisla = [3, 17, 5, 42, 8, 99, 1, 56]
maksimum = chisla[0]

# Найди максимум вручную
`,
      checkType: "output_contains",
      expectedOutput: "99",
    }),
    hint: "for chislo in chisla: if chislo > maksimum: maksimum = chislo",
    solution: `chisla = [3, 17, 5, 42, 8, 99, 1, 56]
maksimum = chisla[0]

for chislo in chisla:
    if chislo > maksimum:
        maksimum = chislo

print(maksimum)`,
  });

  await storage.createStep({
    lessonId: lesson6.id,
    order: 4,
    type: "coding",
    title: "Переворот списка без reverse()",
    content: JSON.stringify({
      description: `Переверни список **без использования метода \`reverse()\`**.

**Идея:** Создай новый пустой список и добавляй элементы с конца исходного.

Используй \`range(len(spisok)-1, -1, -1)\` для перебора с конца, или другой способ.

Список: \`bukvy = ["а", "б", "в", "г", "д"]\`
Ожидаемый результат: \`["д", "г", "в", "б", "а"]\``,
      starterCode: `bukvy = ["а", "б", "в", "г", "д"]
perevernutiy = []

# Переверни список
`,
      checkType: "output_contains",
      expectedOutput: "д",
    }),
    hint: "for i in range(len(bukvy)-1, -1, -1): perevernutiy.append(bukvy[i])",
    solution: `bukvy = ["а", "б", "в", "г", "д"]
perevernutiy = []

for i in range(len(bukvy)-1, -1, -1):
    perevernutiy.append(bukvy[i])

print(perevernutiy)`,
  });

  console.log("База данных успешно заполнена! 6 уроков добавлено.");
}
