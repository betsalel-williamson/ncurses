-- pandoc filter for the man pages (sync.mjs). GFM can't close emphasis next to a space or
-- around punctuation alone, so pandoc's output for some troff showed literal ** on the site:
--   \fB\-v \fP  -> **-v **      (space inside the bold)
--   verch\fB,\fP -> verch**,**  (bold punctuation inside a word)
--   \fBbox(\fIwin\fR -> **box(**win  (punctuation at the edge, a letter beside it)
-- Move leading and trailing spaces out of bold and italic, drop the emphasis on runs that are
-- only punctuation, where it can't be seen anyway, and write the rest of the cases GFM can't
-- delimit as HTML tags.

local function is_space(el)
  return el and (el.t == 'Space' or el.t == 'SoftBreak' or el.t == 'LineBreak')
end

local function only_punctuation(content)
  local text = pandoc.utils.stringify(content)
  return text ~= '' and not text:find('[%w]')
end

local function tidy(el)
  local before, after = {}, {}
  while is_space(el.content[1]) do table.insert(before, table.remove(el.content, 1)) end
  while is_space(el.content[#el.content]) do table.insert(after, 1, table.remove(el.content)) end
  local out = {}
  for _, s in ipairs(before) do table.insert(out, s) end
  if #el.content > 0 then
    if only_punctuation(el.content) then
      for _, c in ipairs(el.content) do table.insert(out, c) end
    else
      table.insert(out, el)
    end
  end
  for _, s in ipairs(after) do table.insert(out, s) end
  return out
end

local function first_char(el)
  local s = el and pandoc.utils.stringify(el) or ''
  return s:sub(1, 1)
end

local function last_char(el)
  local s = el and pandoc.utils.stringify(el) or ''
  return s:sub(-1)
end

local function is_word(c) return c ~= '' and c:find('[%w]') ~= nil end
local function is_punct(c) return c ~= '' and c:find('[%p]') ~= nil end

-- Bold or italic that GFM would read as literal asterisks: punctuation on an edge with a
-- letter or digit right outside it.
local function html_tags(inlines)
  local out = pandoc.List()
  for i, el in ipairs(inlines) do
    if el.t == 'Strong' or el.t == 'Emph' then
      local first, last = first_char(el.content), last_char(el.content)
      local before, after = last_char(inlines[i - 1]), first_char(inlines[i + 1])
      if (is_punct(first) and is_word(before)) or (is_punct(last) and is_word(after)) then
        local tag = el.t == 'Strong' and 'strong' or 'em'
        out:insert(pandoc.RawInline('html', '<' .. tag .. '>'))
        out:extend(el.content)
        out:insert(pandoc.RawInline('html', '</' .. tag .. '>'))
      else
        out:insert(el)
      end
    else
      out:insert(el)
    end
  end
  return out
end

return { { Strong = tidy, Emph = tidy }, { Inlines = html_tags } }
