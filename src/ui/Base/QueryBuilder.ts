import { ExpressionBuilder } from './ExpressionBuilder';
import { IRankingFunction } from '../../rest/RankingFunction';
import { IQueryFunction } from '../../rest/QueryFunction';
import { IGroupByRequest } from '../../rest/GroupByRequest';
import { IQuery } from '../../rest/Query';
import { QueryBuilderExpression } from './QueryBuilderExpression';
import * as _ from 'underscore';
import { Utils } from '../../utils/Utils';

/**
 * The QueryBuilder is used to build a {@link IQuery} that will be able to be executed using the Search API.
 *
 * The class exposes several members and methods that help components and external code to build up the final query that is sent to the Search API.
 *
 */
export class QueryBuilder {
  /**
   * Used to build the basic part of the query expression.
   *
   * This part typically consists of user-entered content such as query keywords, etc.
   * @type {Coveo.ExpressionBuilder}
   */
  public expression: ExpressionBuilder = new ExpressionBuilder();
  /**
   * Used to build the advanced part of the query expression.
   *
   * This part is typically formed of filter expressions generated by components such as facets, external code, etc.
   * @type {Coveo.ExpressionBuilder}
   */
  public advancedExpression: ExpressionBuilder = new ExpressionBuilder();
  /**
   * Used to build the advanced part of the query expression.
   *
   * This part is similar to `advancedExpression`, but its content is interpreted as a constant expression by the index and it takes advantage of special caching features.
   * @type {Coveo.ExpressionBuilder}
   */
  public constantExpression: ExpressionBuilder = new ExpressionBuilder();
  /**
   * The contextual text.
   *
   * This is the contextual text part of the query. It uses the Coveo Machine Learning service to pick key keywords from the text and add them to the basic expression.
   * This field is mainly used to pass context such a case description, long textual query or any other form of text that might help in
   * refining the query.
   */
  public longQueryExpression: ExpressionBuilder = new ExpressionBuilder();
  /**
   * Used to build the disjunctive part of the query expression.
   *
   * When present, this part is evaluated separately from the other expressions and the matching results are merged to those matching expressions, `advancedExpression` and `constantExpression`.
   *
   * The final boolean expression for the query is thus (basic advanced constant) OR (disjunction).
   * @type {Coveo.ExpressionBuilder}
   */
  public disjunctionExpression: ExpressionBuilder = new ExpressionBuilder();
  /**
   * The hub value set from the {@link Analytics} component.
   *
   * Used for analytics reporting in the Coveo platform.
   */
  public searchHub: string;
  /**
   * The tab value set from the {@link Tab} component.
   */
  public tab: string;
  public locale: string;
  /**
   * Name of the query pipeline to use.
   *
   * This specifies the name of the query pipeline to use for the query. If not specified, the default value is default, which means the default query pipeline will be used.
   */
  public pipeline: string;
  /**
   * The maximum age for cached query results, in milliseconds.
   *
   * If results for the exact same request (including user identities) are available in the in-memory cache, they will be used if they are not older than the specified value.
   *
   * Otherwise, the query will be sent to the index.
   */
  public maximumAge: number;

  /**
   * Whether to interpret wildcard characters (`*`) in the basic [`expression`]{@link QueryBuilder.expression} keywords.
   *
   * Setting this attribute to `true` enables the wildcards features of the index, effectively expanding keywords
   * containing wildcard characters (`*`) to the possible matching keywords in order to broaden the query (see
   * [Using Wildcards in Queries](http://www.coveo.com/go?dest=cloudhelp&lcid=9&context=359)).
   *
   * See also [`enableQuestionMarks`]{@link QueryBuilder.enableQuestionMarks}.
   *
   * **Note:**
   * > Normally, the [`enableWildcards`]{@link Querybox.options.enableWildcards} option of the
   * > [`Querybox`]{@link Querybox} component determines the value of this attribute during the initialization of the
   * > search page.
   */
  public enableWildcards: boolean;

  /**
   * Whether to interpret question mark characters (`?`) in the basic [`expression`]{@link QueryBuilder.expression}
   * keywords (see [Using Wildcards in Queries](http://www.coveo.com/go?dest=cloudhelp&lcid=9&context=359).
   *
   * Setting this attribute to `true` has no effect unless [`enableWildcards`]{@link QueryBuilder.enableWildcards} is
   * also `true`.
   *
   * **Note:**
   * > Normally, the [`enableQuestionMarks`]{@link Querybox.options.enableQuestionMarks} option of the
   * > [`Querybox`]{@link Querybox} component determines the value of this attribute during the initialization of the
   * > search page.
   */
  public enableQuestionMarks: boolean;

  /**
   * Whether to interpret special query syntax (e.g., `@objecttype=message`) in the basic
   * [`expression`]{@link QueryBuilder.expression} (see
   * [Coveo Query Syntax Reference](http://www.coveo.com/go?dest=adminhelp70&lcid=9&context=10005)).
   *
   * See also [`enableLowercaseOperators`]{@link QueryBuilder.enableLowercaseOperators}.
   *
   * **Note:**
   * > Normally, the [`enableQuerySyntax`]{@link Querybox.options.enableQuerySyntax} option of the
   * > [`Querybox`]{@link Querybox} component determines the value of this attribute during the initialization of the
   * search page. End user preferences can also modify the value of this attribute.
   *
   * Default value is `false`
   */
  public enableQuerySyntax: boolean = false;

  /**
   * Whether to interpret the `AND`, `NOT`, `OR`, and `NEAR` keywords in the basic
   * [`expression`]{@link QueryBuilder.expression} as query operators, even if those keywords are in lowercase.
   *
   * Setting this attribute to `true` has no effect unless [`enableQuerySyntax`]{@link QueryBuilder.enableQuerySyntax}
   * is also `true`.
   *
   * **Note:**
   * > Normally, the [`enableLowercaseOperators`]{@link Querybox.options.enableLowercaseOperators} option of the
   * > [`Querybox`]{@link Querybox} component determines the value of this attribute during the initialization of the
   * > search page.
   */
  public enableLowercaseOperators: boolean;

  /**
   * Whether to automatically convert the basic [`expression`]{@link QueryBuilder.expression} to a partial match
   * expression if it contains at least a certain number of keywords (see
   * [`partialMatchKeywords`]{@link QueryBuilder.partialMatchKeywords}), so that items containing at least a certain
   * subset of those keywords (see [`partialMatchThreshold`]{@link QueryBuilder.partialMatchThreshold}) will match the
   * query.
   *
   * **Note:**
   * > Normally, the [`enablePartialMatch`]{@link Querybox.options.enablePartialMatch} option of the
   * > [`Querybox`]{@link Querybox} component determines the value of this attribute during the initialization of the
   * > search page.
   */
  public enablePartialMatch: boolean;

  /**
   * The minimum number of keywords that need to be present in the basic [`expression`]{@link QueryBuilder.expression}
   * to convert it to a partial match expression.
   *
   * The value of this attribute has no meaning unless [`enablePartialMatch`]{@link QueryBuilder.enablePartialMatch} is
   * `true`.
   *
   * See also [`partialMatchThreshold`]{@link QueryBuilder.partialMatchThreshold}.
   *
   * **Note:**
   * > Normally, the [`partialMatchKeywords`]{@link Querybox.options.partialMatchKeywords} option of the
   * > [`Querybox`]{@link Querybox} component determines the value of this attribute during the initialization of the
   * > search page.
   */
  public partialMatchKeywords: number;

  /**
   * An absolute or relative (percentage) value indicating the minimum number of partial match expression keywords an
   * item must contain to match the query.
   *
   * The value of this attribute has no meaning unless [`enablePartialMatch`]{@link QueryBuilder.enablePartialMatch} is
   * `true`.
   *
   * See also [`partialMatchKeywords`]{@link QueryBuilder.partialMatchKeywords}.
   *
   * **Note:**
   * > Normally, the [`partialMatchThreshold`]{@link Querybox.options.partialMatchThreshold} option of the
   * > [`Querybox`]{@link Querybox} component determines the value of this attribute during the initialization of the
   * > search page.
   */
  public partialMatchThreshold: string;
  /**
   * This is the 0-based index of the first result to return.
   *
   * If not specified, this parameter defaults to 0.
   */
  public firstResult: number = 0;
  /**
   * This is the number of results to return, starting from {@link IQuery.firstResult}.
   *
   * If not specified, this parameter defaults to 10.
   */
  public numberOfResults: number = 10;
  /**
   * This specifies the length (in number of characters) of the excerpts generated by the indexer based on the keywords present in the query.
   *
   * The index includes the top most interesting sentences (in the order they appear in the item) that fit in the specified number of characters.
   *
   * When not specified, the default value is 200.
   */
  public excerptLength: number;
  /**
   * This specifies a field on which {@link Folding} should be performed.
   *
   * Folding is a kind of duplicate filtering where only the first result with any given value of the field is included in the result set.
   *
   * It's typically used to return only one result in a conversation, for example when forum posts in a thread are indexed as separate items.
   */
  public filterField: string;
  /**
   * Number of results that should be folded, using the {@link IQuery.filterField}.
   */
  public filterFieldRange: number;
  /**
   * Specifies the `parentField` when doing parent-child loading (See : {@link Folding}).
   */
  public parentField: string;
  /**
   * Specifies the childField when doing parent-child loading (See : {@link Folding}).
   */
  public childField: string;
  public fieldsToInclude: string[];
  public requiredFields: string[] = [];
  public includeRequiredFields: boolean = false;
  public fieldsToExclude: string[];
  /**
   * Whether to enable query corrections on this query (see {@link DidYouMean}).
   */
  public enableDidYouMean: boolean = false;
  /**
   * Whether to enable debug info on the query.
   *
   * This will return additional information on the resulting JSON response from the Search API.
   *
   * Mostly: execution report (a detailed breakdown of the parsed and executed query).
   */
  public enableDebug: boolean = false;
  /**
   * Whether the index should take collaborative rating in account when ranking result (see : {@link ResultRating}).
   */
  public enableCollaborativeRating: boolean;
  /**
   * This specifies the sort criterion(s) to use to sort results. If not specified, this parameter defaults to relevancy.
   *
   * Possible values are : <br/>
   * -- relevancy :  This uses all the configured ranking weights as well as any specified ranking expressions to rank results.<br/>
   * -- dateascending / datedescending Sort using the value of the `@date` field, which is typically the last modification date of an item in the index.<br/>
   * -- qre : Sort using only the weights applied through ranking expressions. This is much like using `relevancy` except that automatic weights based on keyword proximity etc, are not computed.<br/>
   * -- nosort : Do not sort the results. The order in which items are returned is essentially random.<br/>
   * -- @field ascending / @field descending Sort using the value of a custom field.
   */
  public sortCriteria: string = 'relevancy';
  /**
   * @deprecated
   */
  public sortField: string;
  public retrieveFirstSentences: boolean = true;
  public timezone: string;
  public queryUid: string;
  /**
   * This specifies an array of Query Function operation that will be executed on the results.
   */
  public queryFunctions: IQueryFunction[] = [];
  /**
   * This specifies an array of Ranking Function operations that will be executed on the results.
   */
  public rankingFunctions: IRankingFunction[] = [];
  /**
   * This specifies an array of Group By operations that can be performed on the query results to extract facets.
   */
  public groupByRequests: IGroupByRequest[] = [];
  public enableDuplicateFiltering: boolean = false;
  /**
   * The custom context information to send along with the query. Each value should be a string or an array of strings.
   *
   * Custom context information can influence the output of Coveo Machine Learning models and can also be used in query pipeline conditions.
   */
  public context: { [key: string]: any };
  /**
   * The actions history represents the past actions a user made and is used by the Coveo Machine Learning service to suggest recommendations.
   * It is generated by the page view script (https://github.com/coveo/coveo.analytics.js).
   */
  public actionsHistory: string;
  /**
   * This is the ID of the recommendation interface that generated the query.
   */
  public recommendation: string;
  /**
   * Specifies if the Search API should perform queries even when no keywords were entered by the end user.
   *
   * End user keywords are present in either the {@link IQuery.q} or {@link IQuery.lq} part of the query.
   *
   * This parameter is normally controlled by {@link SearchInterface.options.allowEmptyQuery} option.
   */
  public allowQueriesWithoutKeywords: boolean;
  /**
   * Build the current content or state of the query builder and return a {@link IQuery}.
   *
   * build can be called multiple times on the same QueryBuilder.
   * @returns {IQuery}
   */
  public build(): IQuery {
    const query: IQuery = {
      q: this.expression.build(),
      aq: this.advancedExpression.build(),
      cq: this.constantExpression.build(),
      lq: this.longQueryExpression.build(),
      dq: this.disjunctionExpression.build(),

      searchHub: this.searchHub,
      tab: this.tab,
      locale: this.locale,
      pipeline: this.pipeline,
      maximumAge: this.maximumAge,

      wildcards: this.enableWildcards,
      questionMark: this.enableQuestionMarks,
      lowercaseOperators: this.enableLowercaseOperators,
      partialMatch: this.enablePartialMatch,
      partialMatchKeywords: this.partialMatchKeywords,
      partialMatchThreshold: this.partialMatchThreshold,

      firstResult: this.firstResult,
      numberOfResults: this.numberOfResults,
      excerptLength: this.excerptLength,
      filterField: this.filterField,
      filterFieldRange: this.filterFieldRange,
      parentField: this.parentField,
      childField: this.childField,
      fieldsToInclude: this.computeFieldsToInclude(),
      fieldsToExclude: this.fieldsToExclude,
      enableDidYouMean: this.enableDidYouMean,
      sortCriteria: this.sortCriteria,
      sortField: this.sortField,
      queryFunctions: this.queryFunctions,
      rankingFunctions: this.rankingFunctions,
      groupBy: this.groupByRequests,
      retrieveFirstSentences: this.retrieveFirstSentences,
      timezone: this.timezone,
      enableQuerySyntax: this.enableQuerySyntax,
      enableDuplicateFiltering: this.enableDuplicateFiltering,
      enableCollaborativeRating: this.enableCollaborativeRating,
      debug: this.enableDebug,
      context: this.context,
      actionsHistory: this.actionsHistory,
      recommendation: this.recommendation,
      allowQueriesWithoutKeywords: this.allowQueriesWithoutKeywords
    };
    return query;
  }

  /**
   * Return only the expression(s) part(s) of the query, as a string.
   *
   * This means the basic, advanced and constant part in a complete expression {@link IQuery.q}, {@link IQuery.aq}, {@link IQuery.cq}.
   * @returns {string}
   */
  public computeCompleteExpression(): string {
    return this.computeCompleteExpressionParts().full;
  }

  /**
   * Return only the expression(s) part(s) of the query, as an object.
   * @returns {{full: string, withoutConstant: string, constant: string}}
   */
  public computeCompleteExpressionParts(): any {
    return new QueryBuilderExpression(
      this.expression.build(),
      this.advancedExpression.build(),
      this.constantExpression.build(),
      this.disjunctionExpression.build()
    );
  }

  /**
   * Return only the expression(s) part(s) of the query, as a string, except the given expression.
   *
   * This is used by {@link Facet}, to build their group by request with query override.
   * @param except
   * @returns {string}
   */
  public computeCompleteExpressionExcept(except: string): string {
    return this.computeCompleteExpressionPartsExcept(except).full;
  }

  /**
   * Return only the expression(s) part(s) of the query, as an object, except the given expression.
   *
   * This is used by {@link Facet}, to build their group by request with query override.
   * @param except
   * @returns {{full: string, withoutConstant: string, constant: string}}
   */
  public computeCompleteExpressionPartsExcept(except: string): QueryBuilderExpression {
    const withoutConstantAndExcept = ExpressionBuilder.merge(this.expression, this.advancedExpression);
    withoutConstantAndExcept.remove(except);

    const basicWithoutException = new ExpressionBuilder();
    basicWithoutException.fromExpressionBuilder(this.expression);
    basicWithoutException.remove(except);

    const advancedWithoutException = new ExpressionBuilder();
    advancedWithoutException.fromExpressionBuilder(this.advancedExpression);
    advancedWithoutException.remove(except);

    const constantWithoutException = new ExpressionBuilder();
    constantWithoutException.fromExpressionBuilder(this.constantExpression);
    constantWithoutException.remove(except);

    const disjunctionWithoutException = new ExpressionBuilder();
    disjunctionWithoutException.fromExpressionBuilder(this.disjunctionExpression);
    disjunctionWithoutException.remove(except);

    return new QueryBuilderExpression(
      basicWithoutException.build(),
      advancedWithoutException.build(),
      constantWithoutException.build(),
      disjunctionWithoutException.build()
    );
  }

  /**
   * Add fields to specifically include when the results return.
   *
   * This can be used to accelerate the execution time of every query, as there is much less data to process if you whitelist specific fields.
   * @param fields
   */
  public addFieldsToInclude(fields: string[]) {
    this.fieldsToInclude = _.uniq((this.fieldsToInclude || []).concat(fields));
  }

  public addRequiredFields(fields: string[]) {
    this.requiredFields = _.uniq(this.requiredFields.concat(fields));
  }

  /**
   * Add fields to specifically exclude when the results return.
   *
   * This can be used to accelerate the execution time of every query, as there is much less data to process if you blacklist specific fields.
   * @param fields
   */
  public addFieldsToExclude(fields: string[]) {
    this.fieldsToExclude = _.uniq((this.fieldsToInclude || []).concat(fields));
  }

  public computeFieldsToInclude() {
    if (this.includeRequiredFields || this.fieldsToInclude != null) {
      return this.requiredFields.concat(this.fieldsToInclude || []);
    } else {
      return null;
    }
  }

  /**
   * Adds or updates a single context key-value pair in the `context` object.
   *
   * @param key The context key. If this key is already present in the `context` object, its value is updated.
   * @param value The context value. This should be a string or an array of strings.
   */
  public addContextValue(key: string, value: any) {
    if (this.context == null) {
      this.context = {};
    }
    this.context[key] = value;
  }

  /**
   * Merges the specified `values` into the `context` object.
   *
   * @param values The object to merge into the `context` object. Can contain multiple key-value pairs, where each value should be a string or an array of strings. If some keys are already present in the `context` object, their values are updated.
   */
  public addContext(values: { [key: string]: any }) {
    if (this.context == null) {
      this.context = {};
    }
    _.extend(this.context, values);
  }

  /**
   * Returns true if the current query contains any expression that are considered "end user input".
   *
   * This usually means anything entered in the basic (see [q]{@link IQuery.options.q}) or long (see [lq]{@link IQuery.options.lq}) part of the query.
   */
  public containsEndUserKeywords(): boolean {
    const query = this.build();
    return Utils.isNonEmptyString(query.q) || Utils.isNonEmptyString(query.lq);
  }
}
