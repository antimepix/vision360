using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Options;
using scrapperPlanning.Services.Options;

namespace scrapperPlanning.Services;

public sealed class AurionClient
{
    private readonly HttpClient _httpClient;
    private readonly AurionOptions _options;
    private readonly Dictionary<string, AurionState> _states = new(StringComparer.OrdinalIgnoreCase);

    public AurionClient(HttpClient httpClient, IOptions<AurionOptions> options)
    {
        _httpClient = httpClient;
        _options = options.Value;
    }

    public async Task LoginAsync(CancellationToken ct)
    {
        var payload = new Dictionary<string, string>
        {
            ["username"] = _options.Username,
            ["password"] = _options.Password,
            ["j_idt28"] = string.Empty
        };

        var response = await SendAsync(
            "/login",
            HttpMethod.Post,
            ToFormBody(payload),
            new Dictionary<string, string> { ["Content-Type"] = "application/x-www-form-urlencoded" },
            followRedirects: false,
            ct);

        if (response.StatusCode != HttpStatusCode.Found)
        {
            throw new InvalidOperationException($"Login échoué, code HTTP {(int)response.StatusCode}.");
        }
    }

    public async Task<string> IndexAsync(bool allowRedirect, CancellationToken ct)
    {
        var response = await SendAsync(
            "/",
            HttpMethod.Get,
            body: null,
            new Dictionary<string, string>
            {
                ["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
            },
            followRedirects: false,
            ct);

        if (!response.IsSuccessStatusCode && !(allowRedirect && response.StatusCode == HttpStatusCode.Found))
        {
            throw new InvalidOperationException($"Index échoué, code HTTP {(int)response.StatusCode}.");
        }

        var result = await response.Content.ReadAsStringAsync(ct);
        SaveState("/", result);
        return result;
    }

    public async Task<string> SubMenuPageAsync(string submenuId, CancellationToken ct)
    {
        var payload = new Dictionary<string, string>
        {
            ["javax.faces.partial.ajax"] = "true",
            ["javax.faces.source"] = "form:j_idt52",
            ["javax.faces.partial.execute"] = "form:j_idt52",
            ["javax.faces.partial.render"] = "form:sidebar",
            ["form:j_idt52"] = "form:j_idt52",
            ["webscolaapp.Sidebar.ID_SUBMENU"] = $"submenu_{submenuId}",
            ["form"] = "form",
            ["form:largeurDivCenter"] = "810",
            ["form:idInit"] = GetState("/").IdInit,
            ["form:sauvegarde"] = string.Empty,
            ["form:j_idt773_focus"] = string.Empty,
            ["form:j_idt773_input"] = "44323",
            ["javax.faces.ViewState"] = GetState("/").ViewState
        };

        var response = await SendAsync(
            "/faces/MainMenuPage.xhtml",
            HttpMethod.Post,
            ToFormBody(payload),
            new Dictionary<string, string>
            {
                ["Content-Type"] = "application/x-www-form-urlencoded",
                ["Accept"] = "application/xml, text/xml, */*; q=0.01"
            },
            followRedirects: false,
            ct);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"MainMenuPage a échoué, code HTTP {(int)response.StatusCode}.");
        }

        return await response.Content.ReadAsStringAsync(ct);
    }

    public async Task<string> LoadPlanningPageAsync(string menuId, CancellationToken ct)
    {
        var payload = new Dictionary<string, string>
        {
            ["form"] = "form",
            ["form:largeurDivCenter"] = "835",
            ["form:idInit"] = GetState("/").IdInit,
            ["form:sauvegarde"] = string.Empty,
            ["form:j_idt773_focus"] = string.Empty,
            ["form:j_idt773_input"] = "44323",
            ["javax.faces.ViewState"] = GetState("/").ViewState,
            ["form:sidebar"] = "form:sidebar",
            ["form:sidebar_menuid"] = menuId
        };

        var response = await SendAsync(
            "/faces/MainMenuPage.xhtml",
            HttpMethod.Post,
            ToFormBody(payload),
            new Dictionary<string, string>
            {
                ["Content-Type"] = "application/x-www-form-urlencoded",
                ["Accept"] = "application/xml, text/xml, */*; q=0.01"
            },
            followRedirects: true,
            ct);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"loadPlanningPage a échoué, code HTTP {(int)response.StatusCode}, menuId={menuId}.");
        }

        var result = await response.Content.ReadAsStringAsync(ct);
        SaveState("/faces/MainMenuPage.xhtml", result);
        return result;
    }

    public async Task<string> LoadMorePlanningPageAsync(bool pagination, int first, int rows, CancellationToken ct)
    {
        var payload = new Dictionary<string, string>
        {
            ["javax.faces.partial.ajax"] = "true",
            ["javax.faces.source"] = "form:j_idt181",
            ["javax.faces.partial.execute"] = "form:j_idt181",
            ["javax.faces.partial.render"] = "form:j_idt181",
            ["form:j_idt181"] = "form:j_idt181",
            ["form:j_idt181_pagination"] = pagination ? "true" : "false",
            ["form:j_idt181_first"] = first.ToString(),
            ["form:j_idt181_rows"] = rows.ToString(),
            ["form:j_idt181_skipChildren"] = "true",
            ["form:j_idt181_encodeFeature"] = "true",
            ["form"] = "form",
            ["form:largeurDivCenter"] = "820",
            ["form:idInit"] = GetState("/faces/MainMenuPage.xhtml").IdInit,
            ["form:messagesRubriqueInaccessible"] = string.Empty,
            ["form:search-texte"] = string.Empty,
            ["form:search-texte-avancer"] = string.Empty,
            ["form:input-expression-exacte"] = string.Empty,
            ["form:input-un-des-mots"] = string.Empty,
            ["form:input-aucun-des-mots"] = string.Empty,
            ["form:input-nombre-debut"] = string.Empty,
            ["form:input-nombre-fin"] = string.Empty,
            ["form:calendarDebut_input"] = string.Empty,
            ["form:calendarFin_input"] = string.Empty,
            ["form:j_idt181_reflowDD"] = "0_0",
            ["form:j_idt181:j_idt186:filter"] = string.Empty,
            ["form:j_idt181:j_idt188:filter"] = string.Empty,
            ["form:j_idt181:j_idt190:filter"] = string.Empty,
            ["form:j_idt181:j_idt192:filter"] = string.Empty,
            ["form:j_idt181_selection"] = string.Empty,
            ["javax.faces.ViewState"] = GetState("/faces/MainMenuPage.xhtml").ViewState
        };

        var response = await SendAsync(
            "/faces/ChoixPlanning.xhtml",
            HttpMethod.Post,
            ToFormBody(payload),
            new Dictionary<string, string>
            {
                ["Content-Type"] = "application/x-www-form-urlencoded",
                ["Accept"] = "application/xml, text/xml, */*; q=0.01"
            },
            followRedirects: false,
            ct);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"loadMorePlanningPage a échoué, code HTTP {(int)response.StatusCode}.");
        }

        var result = await response.Content.ReadAsStringAsync(ct);
        SaveStateXml("/faces/ChoixPlanning.xhtml", result);
        return result;
    }

    public async Task<string> ChoosePlanningAsync(List<string> planningIds, string buttonId, CancellationToken ct)
    {
        var payload = new Dictionary<string, string>
        {
            ["form"] = "form",
            ["form:largeurDivCenter"] = "820",
            ["form:idInit"] = GetState("/faces/MainMenuPage.xhtml").IdInit,
            ["form:messagesRubriqueInaccessible"] = string.Empty,
            ["form:search-texte"] = string.Empty,
            ["form:search-texte-avancer"] = string.Empty,
            ["form:input-expression-exacte"] = string.Empty,
            ["form:input-un-des-mots"] = string.Empty,
            ["form:input-aucun-des-mots"] = string.Empty,
            ["form:input-nombre-debut"] = string.Empty,
            ["form:input-nombre-fin"] = string.Empty,
            ["form:calendarDebut_input"] = string.Empty,
            ["form:calendarFin_input"] = string.Empty,
            ["form:j_idt181_reflowDD"] = "0_0",
            ["form:j_idt181:j_idt186:filter"] = string.Empty,
            ["form:j_idt181:j_idt188:filter"] = string.Empty,
            ["form:j_idt181:j_idt190:filter"] = string.Empty,
            ["form:j_idt181:j_idt192:filter"] = string.Empty,
            ["form:j_idt181_selection"] = string.Join(",", planningIds),
            [buttonId] = string.Empty,
            ["javax.faces.ViewState"] = GetState("/faces/MainMenuPage.xhtml").ViewState
        };

        var response = await SendAsync(
            "/faces/ChoixPlanning.xhtml",
            HttpMethod.Post,
            ToFormBody(payload),
            new Dictionary<string, string>
            {
                ["Content-Type"] = "application/x-www-form-urlencoded"
            },
            followRedirects: true,
            ct);

        var body = await response.Content.ReadAsStringAsync(ct);
        SaveState("/faces/ChoixPlanning.xhtml", body);
        return body;
    }

    public async Task<string> GetPlanningAsync(long startTimestamp, long endTimestamp, string today, string week, string year, CancellationToken ct)
    {
        const string formIdPlanning = "form:j_idt118";
        var payload = new Dictionary<string, string>
        {
            ["javax.faces.partial.ajax"] = "true",
            ["javax.faces.source"] = formIdPlanning,
            ["javax.faces.partial.execute"] = formIdPlanning,
            ["javax.faces.partial.render"] = formIdPlanning,
            [formIdPlanning] = formIdPlanning,
            [$"{formIdPlanning}_start"] = startTimestamp.ToString(),
            [$"{formIdPlanning}_end"] = endTimestamp.ToString(),
            ["form"] = "form",
            ["form:largeurDivCenter"] = string.Empty,
            ["form:idInit"] = GetState("/faces/ChoixPlanning.xhtml").IdInit,
            ["form:date_input"] = today,
            ["form:week"] = $"{week}-{year}",
            [$"{formIdPlanning}_view"] = "agendaWeek",
            ["form:offsetFuseauNavigateur"] = "-3600000",
            ["form:onglets_activeIndex"] = "0",
            ["form:onglets_scrollState"] = "0",
            ["javax.faces.ViewState"] = GetState("/faces/ChoixPlanning.xhtml").ViewState
        };

        var response = await SendAsync(
            "/faces/Planning.xhtml",
            HttpMethod.Post,
            ToFormBody(payload),
            new Dictionary<string, string>
            {
                ["Content-Type"] = "application/x-www-form-urlencoded",
                ["Accept"] = "application/xml, text/xml, */*; q=0.01"
            },
            followRedirects: false,
            ct);

        var body = await response.Content.ReadAsStringAsync(ct);
        SaveStateXml("/faces/Planning.xhtml", body);
        return body;
    }

    public async Task<string> GetEventDetailsAsync(string eventId, string today, string week, string year, CancellationToken ct)
    {
        const string formIdPlanning = "form:j_idt118";
        var payload = new Dictionary<string, string>
        {
            ["javax.faces.partial.ajax"] = "true",
            ["javax.faces.source"] = formIdPlanning,
            ["javax.faces.partial.execute"] = formIdPlanning,
            ["javax.faces.partial.render"] = "form:modaleDetail form:confirmerSuppression",
            ["javax.faces.behavior.event"] = "eventSelect",
            ["javax.faces.partial.event"] = "eventSelect",
            [$"{formIdPlanning}_selectedEventId"] = eventId,
            ["form"] = "form",
            ["form:largeurDivCenter"] = "835",
            ["form:idInit"] = GetState("/faces/ChoixPlanning.xhtml").IdInit,
            ["form:date_input"] = today,
            ["form:week"] = $"{week}-{year}",
            [$"{formIdPlanning}_view"] = "agendaWeek",
            ["form:offsetFuseauNavigateur"] = "-3600000",
            ["form:onglets_activeIndex"] = "0",
            ["form:onglets_scrollState"] = "0",
            ["javax.faces.ViewState"] = GetState("/faces/Planning.xhtml").ViewState
        };

        var response = await SendAsync(
            "/faces/Planning.xhtml",
            HttpMethod.Post,
            ToFormBody(payload),
            new Dictionary<string, string>
            {
                ["Content-Type"] = "application/x-www-form-urlencoded"
            },
            followRedirects: false,
            ct);

        return await response.Content.ReadAsStringAsync(ct);
    }

    private async Task<HttpResponseMessage> SendAsync(
        string url,
        HttpMethod method,
        string? body,
        Dictionary<string, string>? headers,
        bool followRedirects,
        CancellationToken ct)
    {
        using var request = new HttpRequestMessage(method, url);
        if (body is not null)
        {
            request.Content = new StringContent(body, Encoding.UTF8, "application/x-www-form-urlencoded");
        }

        if (headers is not null)
        {
            foreach (var (key, value) in headers)
            {
                if (!request.Headers.TryAddWithoutValidation(key, value) && request.Content is not null)
                {
                    request.Content.Headers.TryAddWithoutValidation(key, value);
                }
            }
        }

        var response = await _httpClient.SendAsync(request, ct);
        if (!followRedirects || !IsRedirect(response.StatusCode) || response.Headers.Location is null)
        {
            return response;
        }

        var next = response.Headers.Location.IsAbsoluteUri
            ? response.Headers.Location
            : new Uri(_httpClient.BaseAddress!, response.Headers.Location);

        response.Dispose();
        return await _httpClient.GetAsync(next, ct);
    }

    private static bool IsRedirect(HttpStatusCode statusCode) =>
        statusCode is HttpStatusCode.Moved or HttpStatusCode.Redirect or HttpStatusCode.RedirectMethod
            or HttpStatusCode.TemporaryRedirect or HttpStatusCode.PermanentRedirect;

    private void SaveState(string source, string body)
    {
        var viewStateMatch = Regex.Match(
            body,
            "name=\"javax\\.faces\\.ViewState\"[^>]*value=\"([^\"]+)\"",
            RegexOptions.IgnoreCase | RegexOptions.Singleline);

        if (viewStateMatch.Success)
        {
            GetState(source).ViewState = viewStateMatch.Groups[1].Value;
        }

        var idInitMatch = Regex.Match(
            body,
            "name=\"form:idInit\"[^>]*value=\"([^\"]+)\"",
            RegexOptions.IgnoreCase | RegexOptions.Singleline);

        if (idInitMatch.Success)
        {
            GetState(source).IdInit = idInitMatch.Groups[1].Value;
        }
    }

    private void SaveStateXml(string source, string xml)
    {
        var viewStateMatch = Regex.Match(
            xml,
            "<update id=\"j_id1:javax\\.faces\\.ViewState:0\"><!\\[CDATA\\[([^\\]]+)\\]\\]></update>",
            RegexOptions.IgnoreCase | RegexOptions.Singleline);

        if (viewStateMatch.Success)
        {
            GetState(source).ViewState = viewStateMatch.Groups[1].Value;
        }
    }

    private AurionState GetState(string source)
    {
        if (_states.TryGetValue(source, out var state))
        {
            return state;
        }

        state = new AurionState();
        _states[source] = state;
        return state;
    }

    private static string ToFormBody(Dictionary<string, string> payload) =>
        string.Join("&", payload.Select(kvp =>
            $"{Uri.EscapeDataString(kvp.Key)}={Uri.EscapeDataString(kvp.Value)}"));

    private sealed class AurionState
    {
        public string ViewState { get; set; } = string.Empty;
        public string IdInit { get; set; } = string.Empty;
    }
}
